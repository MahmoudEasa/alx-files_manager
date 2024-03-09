import RedisClient from '../utils/redis';
import DBClient from '../utils/db';
import sha1Hash from '../utils/hashUtils';
import { v4 as uuidv4 } from 'uuid';

class AuthController {
  static async getConnect(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const [email, password] = credentials.split(':');

      const hashedPassword = sha1Hash(password);
      const user = await DBClient.userCollection.findOne({ email, password: hashedPassword });
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const token = uuidv4();

      const redisKey = `auth_${token}`;
      const userId = user._id.toString();
      const duration = (24 * 60 * 60);
      await RedisClient.setAsync(redisKey, duration, userId);

      return res.status(201).json({ token });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getDisconnect(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) return res.status(400).json({ error: 'Missing X-Token' });

      const redisKey = `auth_${token}`;
      const id = await RedisClient.getAsync(redisKey);
      if (!id) return res.status(401).json({ error: 'Unauthorized' });

      await RedisClient.delAsync(redisKey);
      return res.status(204).json({});
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default (AuthController);
