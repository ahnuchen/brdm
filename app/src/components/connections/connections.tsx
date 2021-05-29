import React, { forwardRef, Ref, useImperativeHandle, useState } from 'react'
import { useMount, usePersistFn } from 'ahooks'
import { Button, Collapse } from 'antd'
import { ConnectionMenu } from '@/src/components/connections/connection-menu'
import { OperateItem } from '@/src/components/connections/operate-item'
import { KeyList } from '@/src/components/key-list'

const ConnectionsInner = (props: any, ref: Ref<any>): JSX.Element => {
  const [connections, setConnections] = useState<ConnectionConfig[]>([])
  // Collapse expand keys
  const [activeKeys, setActiveKeys] = useState<string | string[]>([])

  const initConnection = usePersistFn(() => {
    const connections = $tools.storage.getConnections(true)
    const slovedConnections = []

    for (const item of connections) {
      item.connectionName = $tools.storage.getConnectionName(item)
      slovedConnections.push(item)
    }
    setConnections(slovedConnections)
  })

  useMount(() => {
    $tools.$bus.on($tools.EventTypes.RefreshConnection, initConnection)
    initConnection()
  })

  useImperativeHandle(ref, () => ({
    initConnection,
  }))

  return (
    <Collapse
      onChange={(keys) => {
        setActiveKeys(keys)
      }}
      activeKey={activeKeys}
      ghost={true}
      expandIconPosition="left"
      className="connection-list"
    >
      {connections.map((item, index) => (
        <Collapse.Panel
          extra={<ConnectionMenu config={item} />}
          key={item.connectionName || index}
          header={item.connectionName}
        >
          <OperateItem />
          <KeyList />
        </Collapse.Panel>
      ))}
    </Collapse>
  )
}

export const Connections = forwardRef(ConnectionsInner)
