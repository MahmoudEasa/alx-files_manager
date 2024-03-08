import { MongoClient } from 'mongodb';

class DBClient {
    constructor() {
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || 27017;
        const database = process.env.DB_DATABASE || 'files_manager';
        const url = `mongodb://${host}:${port}/${database}`;
        this.connected = false;
        this.client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
        this.connect();
    }

    async connect() {
      try {
        console.log("Loading....");
        await this.client.connect();
        this.connected = true;
        console.log('Connected to MongoDB');
      } catch (error) {
        this.connected = false;
        console.error('MongoDB connection error:', error);
      }
    }

    isAlive() {
      return (this.connected);
    }
    
    async nbUsers() {
      try {
        const userCount = await this.client.db().collection('users').countDocuments();
        return userCount;
      } catch (err) {
        console.log(err);
      }
    }
    
    async nbFiles() {
      try {
        const filesCount = await this.client.db().collection('files').countDocuments();
        return filesCount;
      } catch (err) {
        console.log(err);
      }
    }
}

export default new DBClient();
