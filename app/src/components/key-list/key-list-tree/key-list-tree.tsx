import React, { useEffect, useState } from 'react'
import utils from '@/src/common/utils'
import { Tree } from 'antd'
import { DataNode, EventDataNode } from 'rc-tree/lib/interface'
import './key-list-tree.less'

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

  const onExpand = (expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue)
  }

  const onCheck = (checkedKeysValue: AnyObj, info: any) => {
    setCheckedKeys(checkedKeysValue as React.Key[])
  }

  const onSelect = (selectedKeysValue: React.Key[], info: any) => {
    if (selectedKeysValue?.length !== 0) {
      setSelectedKeys(selectedKeysValue)
    }
    const node: EventDataNode = info.node
    if (node.children && node.children?.length > 0) {
      if (!node.expanded) {
        setExpandedKeys((keys) => keys.concat(node.key))
      } else {
        setExpandedKeys((keys) => keys.filter((k) => k !== node.key))
      }
    }
  }

  useEffect(() => {
    const treeData = separator ? utils.keysToTree(keyList, separator) : utils.keysToList(keyList)
    setTreeData(() => treeData as DataNode[])
  }, [keyList])

  return (
    <ul>
      <Tree
        checkable={true}
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
    </ul>
  )
}
