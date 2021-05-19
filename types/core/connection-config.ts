import { RedisOptions } from 'ioredis'

declare global {
  interface ConnectionConfig extends RedisOptions {
    name?: string
    key?: string
  }
}
