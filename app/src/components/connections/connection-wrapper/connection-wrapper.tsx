import React, { forwardRef, Ref, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { ConnectionMenu } from '@/src/components/connections/connection-menu'
import { OperateItem } from '@/src/components/connections/operate-item'
import { KeyList } from '@/src/components/key-list'
import { useMount, usePersistFn, useUnmount } from 'ahooks'
import IORedis from 'ioredis'
import redisClient from '@/src/common/redisClient'
import { message } from 'antd'

interface ConnectionWrapperProps {
  isMenu: boolean
  config: ConnectionConfig
  closeMenu(key: ConnectionConfig['connectionName']): void
  activeKeys: string[]
}

function ConnectionWrapperInner(
  { isMenu, config, closeMenu, activeKeys }: ConnectionWrapperProps,
  ref: Ref<any>
): JSX.Element {
  const operateItemRef = useRef<any>()
  const keyListRef = useRef<any>()
  const [opening, setOpening] = useState(true)
  const clientRef = useRef<IORedisClient | null>(null)

  const closeConnection = usePersistFn((connectionName) => {
    // if connectionName is not passed, will close all connections
    if (connectionName && connectionName != config.connectionName) {
      return
    }

    closeMenu(config.connectionName)
    // TODO close all tab after close connection
    // $tools.$bus.emit($tools.EventTypes.RemoveAllTab)

    // TODO reset operateItem items
    // operateItemRef.current.resetStatus()
    // reset keyList items
    keyListRef.current.resetKeyList(true)

    clientRef.current && clientRef.current?.quit()
    clientRef.current = null
  })

  const initShow = usePersistFn(() => {
    if (operateItemRef.current && keyListRef.current) {
      operateItemRef.current.initShow()
      keyListRef.current.initShow()
    } else {
      const t = setTimeout(() => {
        operateItemRef.current.initShow()
        keyListRef.current.initShow()
        clearTimeout(t)
      }, 300)
    }
  })

  const openConnection = usePersistFn(({ connectionName, callback }) => {
    console.log('%c connectionName', 'background: red; color: #000', connectionName, config)
    if (connectionName && connectionName !== config.connectionName) {
      return
    }
    console.log('%c connectionName', 'background: pink; color: #000', connectionName)
    setOpening(true)
    if (clientRef.current) {
      afterOpenConnection(clientRef.current)
    } else {
      const clientPromise = getRedisClient(config)

      clientPromise
        .then((realClient) => {
          afterOpenConnection(realClient, callback)
        })
        .catch((e) => {})
    }
  })

  const afterOpenConnection = usePersistFn((client: IORedisClient, callback?) => {
    if (client.status !== 'ready') {
      client.on('ready', () => {
        $tools.$bus.emit('openStatus', { client, connectionName: config.connectionName })
        initShow()
        console.log('%c client', 'background: pink; color: #000', client, callback)
        callback && callback()
      })
    } else {
      initShow()
      callback && callback()
    }
  })

  const getRedisClient = usePersistFn((config: ConnectionConfig) => {
    let clientPromise
    if (config.SSHTunnel) {
      //todo add ssh client
      console.log('%c todo', 'background: pink; color: #000')
      clientPromise = redisClient.createSSHConnection(
        config.sshOptions,
        config.host,
        config.port,
        config.password,
        config
      )
    } else {
      clientPromise = redisClient.createConnection(config.host, config.port, config.password, config, true)
    }
    clientPromise
      .then((client) => {
        clientRef.current = client
        client.on('error', (error) => {
          message.error({
            content: 'Redis Client On Error: ' + error + ' Config right?',
            duration: 3000,
          })
          closeConnection(config.connectionName)
        })
      })
      .catch((error) => {
        message.error(error.message)
        closeConnection(config.connectionName)
      })
    return clientPromise
  })

  useEffect(() => {
    if (!isMenu) {
      console.log('%c activeKeys', 'background: black; color: white', activeKeys)
    }
  }, [activeKeys])

  useMount(() => {
    $tools.$bus.on($tools.EventTypes.CloseConnection, closeConnection)
  })

  useImperativeHandle(ref, () => ({
    openConnection,
  }))

  return isMenu ? (
    <ConnectionMenu config={config} />
  ) : (
    <>
      {config.connectionName}
      <OperateItem ref={operateItemRef} />
      <KeyList ref={keyListRef} />
    </>
  )
}

export const ConnectionWrapper = forwardRef(ConnectionWrapperInner)
