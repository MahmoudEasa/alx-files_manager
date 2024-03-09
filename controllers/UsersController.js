import DBClient from '../utils/db';
import sha1Hash from '../utils/hashUtils';

class UsersController {
  static async postNew(req, res) {
    try {
      const { email, password } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }

      if (!password) {
        return res.status(400).json({ error: 'Missing password' });
      }

      const existingUser = await DBClient.userCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exists' });
      }

      const hashedPassword = sha1Hash(password);
      let data = {
        email,
        password: hashedPassword,
      };

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
}

export default (UsersController);
