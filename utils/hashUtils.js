import crypto from 'crypto';

export default (val) => {
  const hash = crypto.createHash('sha1');
  hash.update(val);
  return (hash.digest('hex'));
};
