import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}/${this.database}`;
    this.client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    this.connected = false;
    this.userCollection = null;
    this.filesCollection = null;
    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      this.connected = true;
      this.userCollection = this.client.db(this.database).collection('users');
      this.filesCollection = this.client.db(this.database).collection('files');
    } catch (error) {
      this.connected = false;
    }
  }

  isAlive() {
    return (this.connected);
  }

  async nbUsers() {
    let userCount = null;
    try {
      userCount = await this.userCollection.countDocuments();
    } catch (err) {
      console.log(err);
    }
    return (userCount);
  }

  async nbFiles() {
    let filesCount = null;
    try {
      filesCount = await this.filesCollection.countDocuments();
    } catch (err) {
      console.log(err);
    }
    return (filesCount);
  }
}

export default new DBClient();
