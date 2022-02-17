import React, { Dispatch, SetStateAction, useEffect } from 'react'
import { i18n } from '@/src/i18n/i18n'
import { DataNode } from 'rc-tree/lib/interface'
import './style.less'
import { $bus, EventTypes } from '@/src/common/emitter'
import { message } from 'antd'

type ITreeNode = DataNode & { nameBuffer: any }
interface RightClickMenuProps {
  contextNode: DataNode | ITreeNode
  contextMenuVisible: boolean
  setContextMenuVisible: Dispatch<SetStateAction<boolean>>
  setCheckable: Dispatch<SetStateAction<boolean>>
  cmLeft: number
  cmTop: number
  client: IORedisClient
}

export function RightClickMenu({
  contextMenuVisible,
  contextNode,
  cmLeft,
  cmTop,
  setCheckable,
  setContextMenuVisible,
  client,
}: RightClickMenuProps): JSX.Element {
  useEffect(() => {
    if (contextMenuVisible) {
      document.addEventListener('click', () => {
        setContextMenuVisible(false)
      })
    } else {
      document.removeEventListener('click', () => {
        setContextMenuVisible(false)
      })
    }
  }, [contextMenuVisible])

  const contextMenus = [
    {
      name: i18n.$t('copy'),
      onClick() {
        require('electron').clipboard.writeText(contextNode?.title as string)
      },
    },
    {
      name: i18n.$t('Transfer.remove'),
      onClick() {
        const keyBuffer = Buffer.from((contextNode as ITreeNode).nameBuffer.data)
        client
          .del(keyBuffer)
          .then((reply) => {
            if (reply === 1) {
              message.success(i18n.$t('delete_success'), 1)
              $bus.emit(EventTypes.RefreshKeyList, client, keyBuffer, 'del')
            } else {
              message.error(i18n.$t('delete_failed'))
            }
          })
          .catch((e) => message.error(i18n.$t('delete_failed')))
      },
    },
    {
      name: i18n.$t('multiple_select'),
      onClick() {
        setCheckable(true)
      },
    },
    {
      name: i18n.$t('open_new_tab'),
      onClick() {
        $bus.emit(EventTypes.ClickedKey, client, contextNode?.key, true)
      },
    },
  ]

  const contextMenusFold = [
    {
      name: i18n.$t('multiple_select'),
      onClick() {
        setCheckable(true)
      },
    },
    {
      name: i18n.$t('delete_folder'),
      onClick() {
        console.log('delete_folder')
      },
    },
  ]
  return (
    <>
      {contextMenuVisible && (
        <div style={{ left: cmLeft, top: cmTop }} className="context-menu-wrapper">
          {(contextNode?.children ? contextMenusFold : contextMenus).map((item) => (
            <div key={item.name} className="context-menu-item" onClick={item.onClick}>
              {item.name}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
