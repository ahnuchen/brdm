import { RedisOptions } from 'ioredis'
import tunnelssh from 'tunnel-ssh'

declare global {
  interface SSHOptions extends tunnelssh.Config {
    timeout: number | 30000
    privatekeybookmark?: string
    privatekey?: string
  }
  interface ConnectionConfig extends RedisOptions {
    name?: string
    key?: string
    sslOptions?: SSHOptions
    cluster?: boolean
    connectionName?: string
    separator?: string
    SSHTunnel?: boolean
    SSLTunnel?: boolean
    clusterMode?: boolean
  }
}
