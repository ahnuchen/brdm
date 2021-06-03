import React, { useEffect, useState } from 'react'
import utils from '@/src/common/utils'
import { Tree } from 'antd'
import { DataNode } from 'rc-tree/lib/interface'

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
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(false)

  const onExpand = (expandedKeysValue: React.Key[]) => {
    console.log('onExpand', expandedKeysValue)
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    setExpandedKeys(expandedKeysValue)
    setAutoExpandParent(false)
  }

  const onCheck = (checkedKeysValue: AnyObj, info: any) => {
    console.log('onCheck', checkedKeysValue)
    setCheckedKeys(checkedKeysValue as React.Key[])
  }

  const onSelect = (selectedKeysValue: React.Key[], info: any) => {
    console.log('onSelect', info)
    setSelectedKeys(selectedKeysValue)
  }

  useEffect(() => {
    const treeData = separator ? utils.keysToTree(keyList, separator) : utils.keysToList(keyList)
    setTreeData(() => treeData as DataNode[])
  }, [keyList])

  return (
    <ul>
      <Tree
        virtual={true}
        onExpand={onExpand}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        onCheck={onCheck}
        checkedKeys={checkedKeys}
        onSelect={onSelect}
        selectedKeys={selectedKeys}
        treeData={treeData}
      />
    </ul>
  )
}
