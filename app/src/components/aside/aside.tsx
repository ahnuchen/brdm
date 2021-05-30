import React, { useRef, useState } from 'react'
import './aside.less'
import { Button } from 'antd'
import { PlusOutlined, SettingOutlined } from '@ant-design/icons'
import { i18n } from '@/src/i18n/i18n'
import { Settings } from '@/src/components/aside/settings'
import { NewConnectionModal } from '@/src/components/new-connection-modal'
import { Connections } from '@/src/components/connections'

export function Aside(): JSX.Element {
  const [visible, setVisible] = useState(false)
  const [connectionModalVisible, setConnectionModalVisible] = useState(false)
  const connectionsRef = useRef({ initConnection: (config: ConnectionConfig) => {} })

  return (
    <div className="aside">
      <div className="aside-top flex center">
        <Button
          onClick={() => {
            setConnectionModalVisible(true)
          }}
          type="primary"
          icon={<PlusOutlined />}
          className="flex-1"
        >
          {i18n.$t('new_connection')}
        </Button>
        <Button
          onClick={() => {
            setVisible(true)
          }}
          className="aside-top-setting-btn"
          icon={<SettingOutlined />}
        />
      </div>
      <NewConnectionModal
        visible={connectionModalVisible}
        setVisible={setConnectionModalVisible}
        editMode={false}
        onConfigFinished={(config) => {
          connectionsRef.current.initConnection(config)
        }}
      />
      <Settings visible={visible} setVisible={setVisible} />
      <div className="connections-list">
        <Connections ref={connectionsRef} />
      </div>
    </div>
  )
}
