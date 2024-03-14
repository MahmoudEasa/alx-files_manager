import Queue from 'bull';
import fs from 'fs';
import { ObjectId } from 'mongodb';
import thumbnail from 'image-thumbnail';
import DBClient from './utils/db';

const fileQueue = new Queue('fileQueue');
const userQueue = new Queue('userQueue');

const generateThumbnails = async (localPath, width) => {
  try {
    const imageBuffer = await fs.promises.readFile(localPath);
    const thumbnailBuffer = await thumbnail(imageBuffer, { width });
    const path = `${localPath}_${width}`;
    await fs.promises.writeFile(path, thumbnailBuffer);
  } catch (err) {
    console.log(err);
  }
};

fileQueue.process(async (job) => {
  try {
    const { userId, fileId } = job.data;

    if (!fileId) throw new Error('Missing fileId');
    if (!userId) throw new Error('Missing userId');

    const file = await DBClient.filesCollection.findOne({
      _id: ObjectId(fileId), userId: ObjectId(userId),
    });

    if (!file) throw new Error('File not found');

    const { localPath } = file;

    await generateThumbnails(localPath, 500);
    await generateThumbnails(localPath, 250);
    await generateThumbnails(localPath, 100);
  } catch (err) {
    console.log(err);
  }
});

userQueue.process(async (job) => {
  const { userId } = job.data;
  if (!userId) throw new Error('Missing userId');

  const user = await DBClient.filesCollection.findOne({ _id: ObjectId(userId) });
  if (!user) throw new Error('User not found');
  console.log(`Welcome ${user.email}!`);
});
