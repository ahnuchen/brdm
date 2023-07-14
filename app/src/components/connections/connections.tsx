import React, { forwardRef, Ref, useImperativeHandle, useRef, useState } from 'react'
import { useMount, usePersistFn, useSelections } from 'ahooks'
import { Button, Collapse } from 'antd'
import { ConnectionWrapper } from '@/src/components/connections/connection-wrapper'
import { $bus, EventTypes } from '@/src/common/emitter'

const ConnectionsInner = (props: any, ref: Ref<any>): JSX.Element => {
  const [connections, setConnections] = useState<ConnectionConfig[]>([])
  // Collapse expand keys
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
    $bus.on(EventTypes.RefreshConnection, initConnection)
    $bus.on(EventTypes.CloseConnection, initConnection)
    initConnection()
  })

  useImperativeHandle(ref, () => ({
    initConnection,
  }))

  return (
    <>
      {connections.map((item, index) => (
        <ConnectionWrapper key={item.connectionName} config={item} />
      ))}
    </>
  )
}

export const Connections = forwardRef(ConnectionsInner)
