import { ObjectId } from 'mongodb';
import sha1 from 'sha1';
import RedisClient from '../utils/redis';
import DBClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    try {
      const { email, password } = req.body;

      if (!email) return res.status(400).json({ error: 'Missing email' });
      if (!password) return res.status(400).json({ error: 'Missing password' });

      const existingUser = await DBClient.userCollection.findOne({ email });
      if (existingUser) return res.status(400).json({ error: 'Already exist' });

      let data = {
        email,
        password: sha1(password),
      };

      const user = await DBClient.userCollection.insertOne(data);
      const [userObj] = user.ops;
      data = {
        id: userObj._id,
        email: userObj.email,
      };

      return res.status(201).json(data);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getMe(req, res) {
    try {
      const token = req.header('X-Token');
      const redisKey = `auth_${token}`;
      const id = await RedisClient.getAsync(redisKey);
      if (!id) return res.status(401).json({ error: 'Unauthorized' });

      const _id = ObjectId(id);
      const user = await DBClient.userCollection.findOne({ _id });
      if (!user) return res.status(400).json({ error: 'User not found' });

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
}

export default UsersController;
