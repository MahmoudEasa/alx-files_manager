import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.isConnected = true;

    this.client.on('error', (err) => {
      console.log(err);
      this.isConnected = false;
    });
    this.client.on('connect', () => { this.isConnected = true; });

    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.setex).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  isAlive() {
    return (this.isConnected);
  }

  async get(key) {
    let data = null;
    try {
      data = await this.getAsync(key);
    } catch (err) {
      console.log(err);
    }
    return (data);
  }

  async set(key, value, duration) {
    try {
      await this.setAsync(key, duration, value);
    } catch (err) {
      console.log(err);
    }
  }

  async del(key) {
    try {
      await this.delAsync(key);
    } catch (err) {
      console.log(err);
    }
  }
}

export default new RedisClient();
