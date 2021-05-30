import React, { forwardRef, Ref, useImperativeHandle, useRef, useState } from 'react'
import { useMount, usePersistFn, useSelections } from 'ahooks'
import { Button, Collapse } from 'antd'
import { ConnectionWrapper } from '@/src/components/connections/connection-wrapper'

const ConnectionsInner = (props: any, ref: Ref<any>): JSX.Element => {
  const connectionWrapperRef = useRef<any>()

  const [connections, setConnections] = useState<ConnectionConfig[]>([])
  // Collapse expand keys
  const [activeKeys, setActiveKeys] = useState<string[]>([])

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
    $tools.$bus.on($tools.EventTypes.CloseConnection, initConnection)
    initConnection()
  })

  const closeMenu = usePersistFn((key: string) => {
    const nextActiveKeys = activeKeys.filter((k) => k !== key)
    setActiveKeys(nextActiveKeys)
  })

  const onCollapseChange = usePersistFn((keys) => {
    // check if is open
    if (keys.length > activeKeys.length) {
      const differanceKey = keys.find((k: string) => !activeKeys.includes(k))
      // connectionWrapperRef.current.openConnection({
      //   connectionName: differanceKey,
      // })
    }
    setActiveKeys(keys)
  })

  useImperativeHandle(ref, () => ({
    initConnection,
  }))

  return (
    <Collapse
      onChange={onCollapseChange}
      activeKey={activeKeys}
      ghost={true}
      expandIconPosition="left"
      className="connection-list"
    >
      {connections.map((item, index) => (
        <Collapse.Panel
          extra={
            <ConnectionWrapper
              activeKeys={activeKeys}
              ref={connectionWrapperRef}
              closeMenu={closeMenu}
              config={item}
              isMenu={true}
            />
          }
          key={item.connectionName}
          header={item.connectionName}
        >
          <ConnectionWrapper
            activeKeys={activeKeys}
            ref={connectionWrapperRef}
            closeMenu={closeMenu}
            config={item}
            isMenu={false}
          />
        </Collapse.Panel>
      ))}
    </Collapse>
  )
}

export const Connections = forwardRef(ConnectionsInner)
