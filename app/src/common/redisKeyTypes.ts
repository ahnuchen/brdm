export const RedisKeyTypes: {
  [T in RedisKeyType]: T
} = {
  string: 'string',
  hash: 'hash',
  set: 'set',
  list: 'list',
  zset: 'zset',
  stream: 'stream',
}
