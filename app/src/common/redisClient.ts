import IORedis, { NatMap, RedisOptions } from 'ioredis'
import tunnelssh from 'tunnel-ssh'
import { remote } from 'electron'
import { message } from 'antd'
import { i18n } from '@/src/i18n/i18n'
import { AddressInfo } from 'net'
import { $bus, EventTypes } from '@/src/common/emitter'
const fs = require('fs')

// fix ioredis hgetall key has been toString()
IORedis.Command.setReplyTransformer('hgetall', (result) => {
  const arr = []
  for (let i = 0; i < result.length; i += 2) {
    arr.push([result[i], result[i + 1]])
  }

  return arr
})

interface ClusterRedisConfig extends Omit<ConnectionConfig, 'cluster'> {
  cluster: true
}

interface NormalRedisConfig extends Omit<ConnectionConfig, 'cluster'> {
  cluster: false
}

class RedisClient {
  createConnection(
    host: ConnectionConfig['host'],
    port: ConnectionConfig['port'],
    auth: ConnectionConfig['password'],
    config: NormalRedisConfig,
    promise?: false | undefined
  ): IORedis.Redis
  createConnection(
    host: ConnectionConfig['host'],
    port: ConnectionConfig['port'],
    auth: ConnectionConfig['password'],
    config: ClusterRedisConfig,
    promise?: false | undefined
  ): IORedis.Cluster
  createConnection(
    host: ConnectionConfig['host'],
    port: ConnectionConfig['port'],
    auth: ConnectionConfig['password'],
    config: ConnectionConfig,
    promise: true
  ): Promise<IORedisClient>
  createConnection(host = '', port = 6379, auth = '', config: ConnectionConfig, promise = true): any {
    const options = this.getRedisOptions(host, port, auth, config)

    let client: IORedisClient
    // standalone IORedis
    if (!config.cluster) {
      client = new IORedis(port, host, options)
    }
    // cluster IORedis
    else {
      const clusterOptions = this.getClusterOptions(options, config.natMap ? config.natMap : {})
      client = new IORedis.Cluster([{ port, host }], clusterOptions)
    }
    if (promise) {
      return new Promise((resolve, reject) => {
        resolve(client)
      })
    }
    return client
  }

  createSSHConnection(
    sshOptions: ConnectionConfig['sshOptions'],
    host = '',
    port = 0,
    auth = '',
    config: ConnectionConfig
  ): Promise<IORedisClient> {
    if (!sshOptions) {
      return this.createConnection(host, port, auth, config, true)
    }
    const sshConfig: tunnelssh.Config = {
      username: sshOptions.username,
      password: sshOptions.password,
      host: sshOptions.host,
      port: sshOptions.port,
      readyTimeout: sshOptions.timeout > 0 ? sshOptions.timeout * 1000 : 30000,
      dstHost: host,
      dstPort: port,
      localHost: '127.0.0.1',
      //@ts-ignore
      localPort: null, // set null to use available port in local machine
      privateKey: this.getFileContent(sshOptions.privatekey, sshOptions.privatekeybookmark),
      passphrase: sshOptions.passphrase ? sshOptions.passphrase : undefined,
      keepaliveInterval: 10000,
    }

    console.log('%c sshConfig', 'background: pink; color: #000', sshConfig)

    const sshConfigRaw = JSON.parse(JSON.stringify(sshConfig))

    const sshPromise = new Promise((resolve, reject) => {
      const server = tunnelssh(sshConfig, (error, server) => {
        console.log('%c tunnelssh', 'background: pink; color: #000', { error }, { server })
        // ssh error only on this, not the 'error' argument...
        server.on('error', (error) => {
          message.error(error.message + ' SSH config right?')
          $bus.emit(EventTypes.CloseConnection)
          // return reject(error);
        })

        if (error) {
          return reject(error)
        }

        const listenAddress = server.address() as AddressInfo

        console.log('%c listenAddress', 'background: black; color: white', listenAddress)
        // ssh standalone IORedis
        if (!config.cluster) {
          // @ts-ignore
          const client: IORedisClient = this.createConnection(
            listenAddress?.address,
            listenAddress?.port,
            auth,
            config,
            false
          )
          return resolve(client)
        }

        // ssh cluster mode
        const configRaw = JSON.parse(JSON.stringify(config))
        configRaw.cluster = false

        // forerunner as a single client
        // @ts-ignore
        const client = this.createConnection(listenAddress.address, listenAddress.port, auth, configRaw, false)

        client.on('ready', () => {
          // get all cluster nodes info
          // @ts-ignore
          client.call('cluster', 'nodes', (error, reply: string) => {
            if (error) {
              return reject(error)
            }

            const nodes = this.getClusterNodes(reply)

            // create ssh tunnel for each node
            this.createClusterSSHTunnels(sshConfigRaw, nodes).then((tunnels) => {
              configRaw.cluster = true
              configRaw.natMap = this.initNatMap(tunnels)

              // select first line of tunnels to connect
              const clusterClient: IORedisClient = this.createConnection(
                tunnels[0].localHost || '127.0.0.1',
                tunnels[0].localPort || 6379,
                auth,
                configRaw
              )

              resolve(clusterClient)
            })
          })
        })
      })
    })

    return sshPromise as Promise<IORedisClient>
  }

  getRedisOptions(host: string, port: number, auth = '', config: ConnectionConfig): RedisOptions {
    return {
      connectTimeout: 30000,
      retryStrategy: (times: number) => {
        return this.retryStragety(times)
      },
      enableReadyCheck: false,
      connectionName: config.connectionName ? config.connectionName : undefined,
      password: auth,
      tls: config.sslOptions ? this.getTLSOptions(config.sslOptions) : undefined,
    }
  }

  getClusterOptions(redisOptions: RedisOptions, natMap = {}) {
    return {
      connectionName: redisOptions.connectionName,
      enableReadyCheck: false,
      slotsRefreshTimeout: 30000,
      redisOptions: redisOptions,
      natMap: natMap,
    }
  }

  getClusterNodes(nodes: string, type = 'master') {
    const result = []
    const nodesArr = nodes.split('\n')

    for (const node of nodesArr) {
      if (!node) {
        continue
      }

      const nodeInfo = node.trim().split(' ')

      if (nodeInfo[2].includes(type)) {
        const dsn = nodeInfo[1].split('@')[0]
        const lastIndex = dsn.lastIndexOf(':')

        const host = dsn.substr(0, lastIndex)
        const port = dsn.substr(lastIndex + 1)

        result.push({ host: host, port: +port })
      }
    }

    return result
  }

  createClusterSSHTunnels(sshConfig: SSHOptions, nodes: RedisOptions[]): Promise<tunnelssh.Config[]> {
    const sshTunnelStack = []

    for (const node of nodes) {
      // tunnelssh will change 'config' param, so just copy it
      const sshConfigCopy = JSON.parse(JSON.stringify(sshConfig))

      // revocery the buffer after json.parse
      sshConfigCopy.privateKey && (sshConfigCopy.privateKey = Buffer.from(sshConfigCopy.privateKey))

      sshConfigCopy.dstHost = node.host
      sshConfigCopy.dstPort = node.port

      const promise = new Promise<tunnelssh.Config>((resolve, reject) => {
        tunnelssh(sshConfigCopy, (error, server) => {
          if (error) {
            return reject(error)
          }

          const addr = server.address()
          const line = {
            // @ts-ignore
            localHost: addr.address,
            // @ts-ignore
            localPort: addr.port,
            dstHost: node.host,
            dstPort: node.port,
          }

          resolve(line)
        })
      })

      sshTunnelStack.push(promise)
    }

    return Promise.all(sshTunnelStack)
  }

  initNatMap(tunnels: tunnelssh.Config[]): NatMap {
    const natMap = {}

    for (const line of tunnels) {
      natMap[`${line.dstHost}:${line.dstPort}`] = { host: line.localHost, port: line.localPort }
    }

    return natMap
  }

  getTLSOptions(options: any) {
    return {
      // ca: options.ca ? fs.readFileSync(options.ca) : '',
      // key: options.key ? fs.readFileSync(options.key) : '',
      // cert: options.cert ? fs.readFileSync(options.cert) : '',
      ca: this.getFileContent(options.ca, options.cabookmark),
      key: this.getFileContent(options.key, options.keybookmark),
      cert: this.getFileContent(options.cert, options.certbookmark),

      checkServerIdentity: () => {
        // skip certificate hostname validation
        return undefined
      },
      rejectUnauthorized: false,
    }
  }

  retryStragety(times: number) {
    const maxRetryTimes = 3

    if (times >= maxRetryTimes) {
      message.error('Too Many Attempts To Reconnect. Please Check The Server Status!')
      $bus.emit(EventTypes.CloseConnection)
      return
    }

    // reconnect after
    return Math.min(times * 200, 1000)
  }

  getFileContent(file?: string, bookmark = '') {
    if (!file) {
      return undefined
    }

    try {
      let bookmarkClose
      // mac app store version, read through bookmark
      if (bookmark) {
        bookmarkClose = remote.app.startAccessingSecurityScopedResource(bookmark)
      }

      const content = fs.readFileSync(file)
      if (typeof bookmarkClose == 'function') {
        bookmarkClose()
      }
      return content
    } catch (e) {
      // force alert
      alert(i18n.$t('key_no_permission') + `\n[${e.message}]`)
      $bus.emit(EventTypes.CloseConnection)

      return undefined
    }
  }
}

export default new RedisClient()
