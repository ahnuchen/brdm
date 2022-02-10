import React, { useEffect, useState } from 'react'
import utils from '@/src/common/utils'
import { Menu, Tree } from 'antd'
import { DataNode, EventDataNode } from 'rc-tree/lib/interface'
import './key-list-tree.less'
import { usePersistFn } from 'ahooks'
import { $bus, EventTypes } from '@/src/common/emitter'
import { i18n } from '@/src/i18n/i18n'

interface KeyListTreeProps {
  keyList: any[]
  client: IORedisClient
  config: ConnectionConfig
}

export function KeyListTree({ keyList, client, config }: KeyListTreeProps): JSX.Element {
  const separator = config.separator === undefined ? ':' : config.separator

  const [treeData, setTreeData] = useState<DataNode[]>()
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([])
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([])
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([])
  const [contextMenuVisible, setContextMenuVisible] = useState(false)
  const [cmLeft, setCmLeft] = useState(0)
  const [cmTop, setCmTop] = useState(0)
  const [contextNode, setContextNode] = useState<DataNode>()

  const onExpand = usePersistFn((expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue)
  })

  const onCheck = usePersistFn((checkedKeysValue: AnyObj, info: any) => {
    setCheckedKeys(checkedKeysValue as React.Key[])
  })

  const onClickNode = usePersistFn((node: EventDataNode, nativeEvent: MouseEvent | null, newTab = false) => {
    const openNewTab = newTab || nativeEvent?.ctrlKey || nativeEvent?.metaKey
    $bus.emit(EventTypes.ClickedKey, client, node.key, openNewTab)
  })

  const onSelect = usePersistFn((selectedKeysValue: React.Key[], info: any) => {
    if (selectedKeysValue?.length !== 0) {
      setSelectedKeys(selectedKeysValue)
    }
    const node: EventDataNode = info.node
    // @ts-ignore
    const allKeys = []
    const getAllEmptyFolders = (node: any) => {
      if (node.children && node.children.length === 1) {
        if (!expandedKeys.includes(node.key)) {
          allKeys.push(node.key)
        }
        getAllEmptyFolders(node.children[0])
      } else if (!expandedKeys.includes(node.key)) {
        allKeys.push(node.key)
      }
    }
    if (node.children && node.children?.length > 0) {
      if (!node.expanded) {
        // open all empty folder
        getAllEmptyFolders(node)
        // @ts-ignore
        setExpandedKeys((keys) => keys.concat(allKeys))
      } else {
        // close
        setExpandedKeys((keys) => keys.filter((k) => k !== node.key))
      }
    } else if (selectedKeysValue?.length !== 0) {
      onClickNode(node, info.nativeEvent)
    }
  })

  const onRightClick = usePersistFn((info: { event: React.MouseEvent; node: EventDataNode }) => {
    console.log('info.node', info.node)
    setContextMenuVisible(true)
    setCmLeft(info.event.clientX)
    setCmTop(info.event.clientY)
    setContextNode(info.node)
  })

  useEffect(() => {
    const treeData = separator ? utils.keysToTree(keyList, separator) : utils.keysToList(keyList)
    setTreeData(() => treeData as DataNode[])
  }, [keyList])

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
      name: 'delete',
      onClick() {
        console.log('delete')
      },
    },
    {
      name: i18n.$t('multiple_select'),
      onClick() {
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
        console.log('multiple_select')
      },
    },
    {
      name: i18n.$t('delete_all'),
      onClick() {
        console.log('delete_all')
      },
    },
  ]

  return (
    <ul>
      <Tree
        onRightClick={onRightClick}
        checkable={false}
        virtual={true}
        onExpand={onExpand}
        expandedKeys={expandedKeys}
        autoExpandParent={false}
        onCheck={onCheck}
        checkedKeys={checkedKeys}
        onSelect={onSelect}
        selectedKeys={selectedKeys}
        treeData={treeData}
      />
      {contextMenuVisible && (
        <div style={{ left: cmLeft, top: cmTop }} className="context-menu-wrapper">
          {(contextNode?.children ? contextMenusFold : contextMenus).map((item) => (
            <div key={item.name} className="context-menu-item" onClick={item.onClick}>
              {item.name}
            </div>
          ))}
        </div>
      )}
    </ul>
  )
}
