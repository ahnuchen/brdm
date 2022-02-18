import React, { useEffect, useState } from 'react'
import utils from '@/src/common/utils'
import { Button, Menu, message, Modal, Table, Tag, Tree } from 'antd'
import { DataNode, EventDataNode } from 'rc-tree/lib/interface'
import './key-list-tree.less'
import { usePersistFn, useToggle, useUpdateEffect } from 'ahooks'
import { $bus, EventTypes } from '@/src/common/emitter'
import { RightClickMenu } from '@/src/components/key-list/right-click-menu'
import { i18n } from '@/src/i18n/i18n'

interface KeyListTreeProps {
  keyList: any[]
  client: IORedisClient
  config: ConnectionConfig
}
type ITreeNode = DataNode & { nameBuffer: any }

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
  const [checkable, setCheckable] = useState(false)
  const [emptyChecked, setEmpty] = useState(false)
  const [checkedNodes, setCheckedNodes] = useState<DataNode[]>([])

  const onExpand = usePersistFn((expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue)
  })

  const onCheck = usePersistFn((checkedKeysValue: AnyObj, info: any) => {
    setCheckedNodes(info.checkedNodes)
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
    setContextMenuVisible(true)
    setCmLeft(info.event.clientX)
    setCmTop(info.event.clientY)
    setContextNode(info.node)
  })

  useEffect(() => {
    const treeData = separator ? utils.keysToTree(keyList, separator) : utils.keysToList(keyList)
    setTreeData(() => treeData as DataNode[])
  }, [keyList])

  useUpdateEffect(() => {
    setCheckable(false)
    setCheckedNodes([])
  }, [emptyChecked])

  const delOneKey = (key: string) => {
    console.log('%c key', 'background: pink; color: #000', key)
    return new Promise((resolve, reject) => {
      client
        .del(key)
        .then((reply) => {
          console.log('reply', reply)
          if (reply === 1) {
            resolve(true)
          } else {
            reject(i18n.$t('delete_failed'))
          }
        })
        .catch((e) => {
          console.log('e.message', e.message)
          reject(e.message)
        })
    })
  }

  const getAllLeafInContextNode = usePersistFn(() => {
    const allnodes: ITreeNode[] = []
    function getNodes(node: ITreeNode) {
      if (node.isLeaf) {
        allnodes.push(node)
      } else if (node.children) {
        // @ts-ignore
        node.children.map(getNodes)
      }
    }
    getNodes((contextNode as never) as ITreeNode)
    return allnodes
  })

  const delFolder = usePersistFn(() => {
    const nodes = getAllLeafInContextNode()
    showDelModal(nodes)
  })

  const showDelModal = usePersistFn((keyNodes?: ITreeNode[]) => {
    const keysTobeDel = keyNodes || checkedNodes.filter((item) => item.isLeaf)
    Modal.confirm({
      title: (
        <div>
          {i18n.$t('keys_to_be_deleted')}
          <Tag>Total: {keysTobeDel.length}</Tag>
        </div>
      ),
      content: (
        <ul>
          <Table
            scroll={{ y: 350 }}
            size="small"
            pagination={false}
            dataSource={keysTobeDel}
            columns={[{ dataIndex: 'title' }]}
          />
        </ul>
      ),
      onOk() {
        Promise.all(
          keysTobeDel.map((item) => {
            return delOneKey(utils.bufToString(Buffer.from(((item as never) as ITreeNode).nameBuffer.data)))
          })
        )
          .then(() => {
            message.success(i18n.$t('delete_success'))
            $bus.emit(EventTypes.RefreshKeyList, client)
          })
          .catch((e) => {
            message.error(e)
          })
      },
    })
  })

  return (
    <ul className="tree-wrap">
      {checkable && (
        <div className="flex around">
          <Button
            block
            size="small"
            danger
            type="primary"
            onClick={() => {
              showDelModal()
            }}
          >
            {i18n.$t('Transfer.remove')}
          </Button>
          <Button
            className="ml-8"
            block
            size="small"
            type="primary"
            onClick={() => {
              setCheckedKeys([])
              setEmpty(!emptyChecked)
            }}
          >
            {i18n.$t('Modal.cancelText')}
          </Button>
        </div>
      )}
      <Tree.DirectoryTree
        onRightClick={onRightClick}
        checkable={checkable}
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
      <RightClickMenu
        delFolder={delFolder}
        checkable={checkable}
        showDelModal={showDelModal}
        setCheckable={setCheckable}
        contextNode={contextNode as DataNode}
        client={client}
        contextMenuVisible={contextMenuVisible}
        setContextMenuVisible={setContextMenuVisible}
        cmLeft={cmLeft}
        cmTop={cmTop}
      />
    </ul>
  )
}
