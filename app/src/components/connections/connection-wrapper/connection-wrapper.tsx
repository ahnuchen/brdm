import React, { forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { ConnectionMenu } from '@/src/components/connections/connection-menu'
import { OperateItem } from '@/src/components/connections/operate-item'
import { KeyList } from '@/src/components/key-list'
import { useMount, usePersistFn } from 'ahooks'
import redisClient from '@/src/common/redisClient'
import { Collapse, message } from 'antd'

interface ConnectionWrapperProps {
  config: ConnectionConfig
}

export function ConnectionWrapper({ config }: ConnectionWrapperProps): JSX.Element {
  const operateItemRef = useRef<any>()
  const keyListRef = useRef<any>()
  const [opening, setOpening] = useState(true)
  const [client, setClient] = useState<IORedisClient | null>(null)
  const [activeKeys, setActiveKeys] = useState<string[]>([])

  const closeMenu = usePersistFn(() => {
    setActiveKeys([])
  })
  const closeConnection = usePersistFn((connectionName) => {
    // if connectionName is not passed, will close all connections
    if (connectionName && connectionName != config.connectionName) {
      return
    }

    closeMenu()

    // TODO close all tab after close connection
    // $tools.$bus.emit($tools.EventTypes.RemoveAllTab)

    // TODO reset operateItem items
    // operateItemRef.current.resetStatus()
    // TODO reset keyList items
    // keyListRef.current.resetKeyList(true)

    client && client.quit()
    setClient(null)
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
    if (connectionName && connectionName !== config.connectionName) {
      return
    }
    setOpening(true)
    if (client) {
      afterOpenConnection(client)
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
        setClient(client)
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

  const onCollapseChange = usePersistFn((keys) => {
    setActiveKeys(keys)

    // open collapse
    if (keys.length > 0) {
      openConnection({
        connectionName: config.connectionName,
      })
    }
  })

  useMount(() => {
    $tools.$bus.on($tools.EventTypes.CloseConnection, closeConnection)
  })

  return (
    <Collapse activeKey={activeKeys} onChange={onCollapseChange}>
      <Collapse.Panel
        extra={<ConnectionMenu config={config} />}
        key={config.connectionName}
        header={config.connectionName}
      >
        <OperateItem ref={operateItemRef} />
        <KeyList config={config} client={client as IORedisClient} ref={keyListRef} />
      </Collapse.Panel>
    </Collapse>
  )
}
