import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import RedisClient from '../utils/redis';
import DBClient from '../utils/db';
import getToken from '../utils/getToken';

const insertFile = async (fileData) => {
  const createdFile = await DBClient.filesCollection.insertOne(fileData);
  const [{
    _id, userId, name, type, isPublic, parentId,
  }] = createdFile.ops;
  const result = {
    id: _id.toString(),
    userId,
    name,
    type,
    isPublic,
    parentId,
  };
  return (result);
};

class FilesController {
  static async postUpload(req, res) {
    try {
      const userId = await getToken(req);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';
      const {
        name,
        type,
        parentId = 0,
        isPublic = false,
        data
      } = req.body;
      const listOfAcceptedType = ['folder', 'file', 'image'];
      const _id = ObjectId(userId);

      const user = await DBClient.userCollection.findOne({ _id });
      if (!user) return res.status(400).json({ error: 'User not found' });

      if (!name) return res.status(400).json({ error: 'Missing name' });
      if (!type || !(listOfAcceptedType.includes(type))) {
        return res.status(400).json({ error: 'Missing type' });
      }
      if (!data && type !== 'folder') {
        return res.status(400).json({ error: 'Missing data' });
      }

      if (parentId) {
        const parentFile = await DBClient.filesCollection.findOne({ _id: ObjectId(parentId) });
        if (!parentFile) return res.status(400).json({ error: 'Parent not found' });

        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      const fileData = {
        userId: user._id.toString(),
        name,
        type,
        isPublic,
        parentId,
      };

      if (type === 'folder') {
        const result = await insertFile(fileData);
        return res.status(201).json(result);
      }

      const filePath = `${FOLDER_PATH}/${uuidv4()}`;
      await fs.promises.mkdir(FOLDER_PATH, { recursive: true });
      await fs.promises.writeFile(filePath, Buffer.from(data, 'base64'));
      fileData.localPath = filePath;

      const result = await insertFile(fileData);
      return res.status(201).json(result);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getShow(req, res) {
    try {
      const token = req.header('x-token');
      if (!token) return res.status(400).json({ error: 'Missing X-Token' });

      const redisKey = `auth_${token}`;
      const id = await RedisClient.getAsync(redisKey);
      if (!id) return res.status(401).json({ error: 'Unauthorized' });

      const _id = new ObjectId(id);
      const user = await DBClient.userCollection.findOne({ _id });
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const data = {
        id: user._id,
        email: user.email,
      };

      return res.status(200).json(data);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getIndex(req, res) {
    try {
      return res.status(200).json({});
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async putPublish(req, res) {
    try {
      return res.status(200).json({});
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async putUnpublish(req, res) {
    try {
      return res.status(200).json({});
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getFile(req, res) {
    try {
      return res.status(200).json({});
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default FilesController;
