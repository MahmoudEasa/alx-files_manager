import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import mime from 'mime-types';
import Queue from 'bull';
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

const putPublishHelp = async (req, data, uId) => {
  let _id = req.params.id;
  _id = new ObjectId(_id);
  const userId = new ObjectId(uId);
  const file = await DBClient.filesCollection.findOneAndUpdate(
    { _id, userId },
    { $set: { isPublic: data } },
    { returnOriginal: false },
  );

  if (file.value) return (file.value);
  return (null);
};

const addToQueue = async (userId, fileId) => {
  try {
    const fileQueue = new Queue('fileQueue');
    await fileQueue.add({ userId, fileId });
  } catch (err) {
    console.log(err);
  }
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
        data,
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
      if (result.type === 'image') await addToQueue(result.userId, result.id);

      return res.status(201).json(result);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getShow(req, res) {
    try {
      let _id = req.params.id;
      let userId = await getToken(req);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      _id = new ObjectId(_id);
      userId = new ObjectId(userId);
      const file = await DBClient.filesCollection.findOne({ _id, userId });
      if (!file) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(file);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getIndex(req, res) {
    try {
      const userId = await getToken(req);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { parentId, page = 0 } = req.query;
      const limit = 20;
      const skip = (+page) * limit;

      let query;
      if (!parentId) query = { userId: new ObjectId(userId) };
      else {
        query = {
          parentId: new ObjectId(parentId),
          userId: new ObjectId(userId),
        };
      }

      const files = await DBClient.filesCollection.aggregate([
        { $match: query },
        { $skip: skip },
        { $limit: limit },
      ]).toArray();

      const result = files.map(({ _id, localPath, ...el }) => ({
        id: _id,
        ...el,
      }));

      return res.status(200).json(result);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async putPublish(req, res) {
    try {
      const userId = await getToken(req);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const result = await putPublishHelp(req, true, userId);

      if (result) return res.status(200).json(result);
      return res.status(404).json({ error: 'Not found' });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async putUnpublish(req, res) {
    try {
      const userId = await getToken(req);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const result = await putPublishHelp(req, false, userId);

      if (result) return res.status(200).json(result);
      return res.status(404).json({ error: 'Not found' });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getFile(req, res) {
    try {
      const _id = new ObjectId(req.params.id);
      const { size } = req.query;
      const sizes = [500, 250, 100];

      const userId = await getToken(req);
      const file = await DBClient.filesCollection.findOne({ _id });
      if (!file) return res.status(404).json({ error: 'Not found' });

      if (!file.isPublic && (!userId || userId !== file.userId.toString())) {
        return res.status(404).json({ error: 'Not found' });
      }

      if (file.type === 'folder') {
        return res.status(400).json({ error: "A folder doesn't have content" });
      }

      if (size && sizes.includes(size)) file.localPath = `${file.localPath}_${size}`;

      await fs.promises.stat(file.localPath);
      const mimeType = mime.lookup(file.name) || 'application/octet-stream';
      res.setHeader('Content-Type', mimeType);
      const fileContent = await fs.promises.readFile(file.localPath);

      return res.status(200).send(fileContent);
    } catch (err) {
      if (err.code === 'ENOENT') return res.status(404).json({ error: 'Not found' });
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default FilesController;
