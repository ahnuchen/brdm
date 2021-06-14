import React, { forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { ConnectionMenu } from '@/src/components/connections/connection-menu'
import { OperateItem } from '@/src/components/connections/operate-item'
import { KeyList } from '@/src/components/key-list'
import { useMount, usePersistFn } from 'ahooks'
import redisClient from '@/src/common/redisClient'
import { Collapse, message } from 'antd'
import { RightOutlined, LoadingOutlined } from '@ant-design/icons'
import { $bus, EventTypes } from '@/src/common/emitter'

interface ConnectionWrapperProps {
  config: ConnectionConfig
}

export function ConnectionWrapper({ config }: ConnectionWrapperProps): JSX.Element {
  const operateItemRef = useRef<any>()
  const keyListRef = useRef<any>()
  const [opening, setOpening] = useState(false)
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
    // $bus.emit(EventTypes.RemoveAllTab)

    // TODO reset operateItem items
    // operateItemRef.current.resetStatus()
    // TODO reset keyList items
    // keyListRef.current.resetKeyList(true)

    client && client.quit()
    setClient(null)
  })

  const initShow = usePersistFn(() => {
    operateItemRef.current.initShow()
    keyListRef.current.initShow()
    /*    let count = 0
    while (count++ < 99) {
      client?.set(`a:${randomString(10)}`, randomString(10))
      client?.set(`a:a:${randomString(10)}`, randomString(10))
      client?.set(`a:b:${randomString(10)}`, randomString(10))
      client?.set(`a:b:c:${randomString(10)}`, randomString(10))
      client?.set(`b:c:${randomString(10)}`, randomString(10))
      client?.set(`b:c:e:${randomString(10)}`, randomString(10))
      client?.set(`b:d:${randomString(10)}`, randomString(10))
    }*/
  })

  const openConnection = usePersistFn(({ connectionName, callback }) => {
    if (connectionName && connectionName !== config.connectionName) {
      return
    }
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
        $bus.emit(EventTypes.OpenStatus, client, config.connectionName)
        initShow()
        callback && callback(client)
      })
    } else {
      initShow()
      callback && callback(client)
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
          message.error('Redis Client On Error: ' + error + ' Config right?', 3)
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

    // open collapse, judge of client to prevent scan keys after first open,
    // user can use refresh button to rescan
    if (keys.length > 0 && !client) {
      openConnection({
        connectionName: config.connectionName,
      })
    }
  })

  const openDefaultKey = () => {
    //TODO 默认打开一个key/status， 方便开发调试，开发完应该删掉此处

    setActiveKeys(['common'])
    openConnection({
      connectionName: 'common',
      callback(client: IORedisClient) {
        $bus.emit(EventTypes.ClickedKey, client, 'a:1hash', false)
      },
    })
  }

  useMount(() => {
    $bus.on(EventTypes.CloseConnection, closeConnection)
    openDefaultKey()
  })

  return (
    <Collapse
      expandIcon={({ isActive }) =>
        opening ? <LoadingOutlined /> : <RightOutlined rotate={isActive ? 90 : 0} />
      }
      activeKey={activeKeys}
      onChange={onCollapseChange}
    >
      <Collapse.Panel
        extra={
          <ConnectionMenu
            onCollapseChange={onCollapseChange}
            config={config}
            client={client as IORedisClient}
          />
        }
        key={config.connectionName}
        header={config.connectionName}
      >
        <OperateItem client={client as IORedisClient} ref={operateItemRef} />
        {client && (
          <KeyList setOpening={setOpening} config={config} client={client as IORedisClient} ref={keyListRef} />
        )}
      </Collapse.Panel>
    </Collapse>
  )
}
