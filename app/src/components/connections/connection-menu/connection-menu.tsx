import React, { useState } from 'react'
import {
  CodeOutlined,
  HomeOutlined,
  PoweroffOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  ReloadOutlined,
  WindowsOutlined,
} from '@ant-design/icons'
import { Dropdown, Menu, Tooltip } from 'antd'
import { ChromePicker } from 'react-color'
import { i18n } from '@/src/i18n/i18n'
import { usePersistFn } from 'ahooks'
import { $bus, EventTypes } from '@/src/common/emitter'

interface ConnectionMenuProps {
  config: ConnectionConfig
  client: IORedisClient
  onCollapseChange(keys: string[]): void
}

export function ConnectionMenu({ config, client, onCollapseChange }: ConnectionMenuProps): JSX.Element {
  const [color, setColor] = useState('#1aad19')

  const deleteConnection = usePersistFn(() => {
    $tools.storage.deleteConnection(config)
    $bus.emit(EventTypes.RefreshConnection)
  })

  const openStatus = usePersistFn(() => {
    const { connectionName } = config
    if (client) {
      $bus.emit(EventTypes.OpenStatus, client, connectionName)
    } else {
      onCollapseChange([connectionName])
    }
  })

  return (
    <div onClick={(event) => event.stopPropagation()} style={{ width: '74px' }} className="flex between">
      <HomeOutlined onClick={openStatus} />
      <CodeOutlined />
      <ReloadOutlined />
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item>
              <Tooltip
                overlay={<ChromePicker color={color} onChange={(color1) => setColor(color1.hex)} />}
                placement="right"
              >
                <StarOutlined />
                {i18n.$t('mark_color')}
              </Tooltip>
            </Menu.Item>
            <Menu.Item>
              <PoweroffOutlined />
              {i18n.$t('close_connection')}
            </Menu.Item>
            <Menu.Item>
              <EditOutlined />
              {i18n.$t('edit_connection')}
            </Menu.Item>
            <Menu.Item onClick={deleteConnection}>
              <DeleteOutlined />
              {i18n.$t('del_connection')}
            </Menu.Item>
          </Menu>
        }
      >
        <WindowsOutlined />
      </Dropdown>
    </div>
  )
}
