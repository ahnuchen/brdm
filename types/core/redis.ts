import IORedis, { RedisOptions } from 'ioredis'
import tunnelssh from 'tunnel-ssh'
import { RedisKeyTypes } from '@/src/common/redisKeyTypes'

declare global {
  interface SSHOptions extends tunnelssh.Config {
    timeout: number | 30000
    privatekeybookmark?: string
    privatekey?: string
  }
  interface SSLOptions {
    key?: string
    ca?: string
    cert?: string
    keybookmark?: string
    cabookmark?: string
    certbookmark?: string
  }
  interface ConnectionConfig extends RedisOptions {
    name?: string
    key?: string
    sshOptions?: SSHOptions
    sslOptions?: SSLOptions
    cluster?: boolean
    connectionName: string
    separator?: string
    SSHTunnel?: boolean
    SSLTunnel?: boolean
    clusterMode?: boolean
  }
  type IORedisClient = IORedis.Redis | IORedis.Cluster
  type RedisKeyType = 'string' | 'hash' | 'set' | 'list' | 'zset' | 'stream'
}
