import RedisClient from './redis';

export default async (req) => {
  const token = req.header('X-Token');
  const redisKey = `auth_${token}`;
  const userId = await RedisClient.getAsync(redisKey);
  return (userId);
};
