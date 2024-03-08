import RedisClient from '../utils/redis';
import DBClient from '../utils/db';

class AppController {
  static getStatus(req, res) {
    const data = {
      redis: RedisClient.isAlive(),
      db: DBClient.isAlive(),
    };
    res.status(200).json(data);
  }

  static async getStats(req, res) {
    try {
      const data = {
        users: await DBClient.nbUsers(),
        files: await DBClient.nbFiles(),
      };
      res.status(200).json(data);
    } catch (err) {
      console.log(err);
    }
  }
}

export default (AppController);
