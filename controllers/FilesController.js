import { ObjectId } from 'mongodb';
import sha1 from 'sha1';
import RedisClient from '../utils/redis';
import DBClient from '../utils/db';

class FilesController {
  static async postUpload(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      let {
        name,
        type,
        parentId,
        isPublic,
        data
      } = req.body;
      const listOfAcceptedType = ['folder', 'file', 'image'];

      if (!parentId) parentId = 0
      if (!isPublic) isPublic = false

      if (!name) return res.status(400).json({ error: 'Missing name' });
      if (!type || !(listOfAcceptedType.includes(type))) return res.status(400).json({ error: 'Missing type' });
      if (!data && type !== 'folder') return res.status(400).json({ error: 'Missing data' });

      // if (f  )

      const existingUser = await DBClient.userCollection.findOne({ email });
      if (existingUser) return res.status(400).json({ error: 'Already exist' });


      const user = await DBClient.userCollection.insertOne(data);
      const [userObj] = user.ops;
      data = {
        email: userObj.email,
        id: userObj._id,
      };

      return res.status(201).json(data);
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
