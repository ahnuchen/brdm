import React, { Dispatch, SetStateAction, useEffect } from 'react'
import { i18n } from '@/src/i18n/i18n'
import { DataNode } from 'rc-tree/lib/interface'
import './style.less'

interface RightClickMenuProps {
  contextNode?: DataNode
  contextMenuVisible: boolean
  setContextMenuVisible: Dispatch<SetStateAction<boolean>>
  setCheckable: Dispatch<SetStateAction<boolean>>
  cmLeft: number
  cmTop: number
}

export function RightClickMenu({
  contextMenuVisible,
  contextNode,
  cmLeft,
  cmTop,
  setCheckable,
  setContextMenuVisible,
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
        console.log('copy')
      },
    },
    {
      name: i18n.$t('Transfer.remove'),
      onClick() {
        console.log('delete')
      },
    },
    {
      name: i18n.$t('multiple_select'),
      onClick() {
        setCheckable(true)
        console.log('multiple_select')
      },
    },
    {
      name: i18n.$t('open_new_tab'),
      onClick() {
        console.log('open_new_tab')
      },
    },
  ]

  const contextMenusFold = [
    {
      name: i18n.$t('multiple_select'),
      onClick() {
        setCheckable(true)
        console.log('multiple_select')
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
