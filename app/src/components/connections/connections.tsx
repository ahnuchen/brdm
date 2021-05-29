import React, { forwardRef, Ref, useImperativeHandle, useState } from 'react'
import { useMount, usePersistFn } from 'ahooks'
import { ConnectionWrapper } from '@/src/components/connections/connection-wrapper'

const ConnectionsInner = (props: any, ref: Ref<any>): JSX.Element => {
  const [connections, setConnections] = useState<ConnectionConfig[]>([])
  const initConnection = usePersistFn((values?) => {
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
    <div className="connection-list">
      {connections.map((item) => (
        <ConnectionWrapper key={item.key || item.connectionName} index={item.connectionName} config={item} />
      ))}
    </div>
  )
}

export const Connections = forwardRef(ConnectionsInner)
