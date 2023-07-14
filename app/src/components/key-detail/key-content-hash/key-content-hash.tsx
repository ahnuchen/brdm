import React, { forwardRef, Ref, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useMount, usePersistFn, useToggle } from 'ahooks'
import { Readable } from 'stream'
import { Button, Form, Input, message, Modal, Space, Table } from 'antd'
import { i18n } from '@/src/i18n/i18n'
import { DeleteFilled, SearchOutlined } from '@ant-design/icons'
import utils from '@/src/common/utils'
import { FormatViewer } from '@/src/components/format-viewer'
interface KeyContentHashProps {
  client: IORedisClient
  redisKey: string
}

interface HashRow {
  index: number
  field: any
  value: any
}

function KeyContentHashInner(
  { client, redisKey }: KeyContentHashProps,
  ref: Ref<ForwardRefProps>
): JSX.Element {
  const scanStream = useRef<Readable | null>(null)
  const pageSize = 1000
  const [data, setData] = useState<HashRow[]>([])
  const [total, setTotal] = useState(0)
  const [filterValue, setFilterValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentContent, setCurrentContent] = useState<Buffer>(Buffer.from(''))
  const [selectedContent, setSelectedContent] = useState<Buffer>(Buffer.from(''))
  const [selectedKey, setSelectedKey] = useState<Buffer>(Buffer.from(''))
  const [currentKey, setCurrentKey] = useState<Buffer>(Buffer.from(''))
  const formatViewRef = useRef<ForwardRefProps>(null)
  const formatViewKeyRef = useRef<ForwardRefProps>(null)
  const formatViewRefAdd = useRef<ForwardRefProps>(null)
  const formatViewRefAddKey = useRef<ForwardRefProps>(null)
  const [addContent, setAddContent] = useState(Buffer.from(''))
  const [addKey, setAddKey] = useState(Buffer.from(''))
  const [visible, { toggle: toggleVisible }] = useToggle(false)

  const initShow = usePersistFn(() => {
    initTotal()
    resetTable()
    Promise.resolve().then(initScanStream)
  })

  const columns = useMemo(
    () => [
      {
        title: 'row',
        dataIndex: 'index',
        width: 100,
        sorter: {
          compare(a: HashRow, b: HashRow) {
            return a.index - b.index
          },
          multiple: 3,
        },
      },
      {
        title: (
          <div className="flex center-v">
            Key
            <Input
              style={{ width: '60%' }}
              onInput={(event) => {
                setFilterValue(event.currentTarget.value)
              }}
              onClick={(e) => e.stopPropagation()}
              suffix={
                <SearchOutlined
                  onClick={(e) => {
                    e.stopPropagation()
                    initShow()
                  }}
                />
              }
              onPressEnter={initShow}
              className="ml-8"
              placeholder={i18n.$t('key_to_search')}
            />
          </div>
        ),
        dataIndex: 'field',
        ellipsis: true,
        sorter: {
          compare(a: HashRow, b: HashRow) {
            return a.field.localeCompare(b.field)
          },
          multiple: 2,
        },
      },
      {
        title: 'Value',
        dataIndex: 'value',
        sorter: {
          compare(a: HashRow, b: HashRow) {
            return a.value.localeCompare(b.value)
          },
          multiple: 1,
        },
      },
      {
        title: 'Action',
        key: 'action',
        width: 100,
        render: (record: HashRow) => (
          <a>
            <DeleteFilled
              onClick={(event) => {
                event.stopPropagation()
                deleteLine(record)
              }}
              className="text-error"
            />
          </a>
        ),
      },
    ],
    []
  )

  const initTotal = usePersistFn(() => {
    client.hlen(redisKey).then((res) => {
      setTotal(res)
    })
  })

  const resetTable = usePersistFn(() => {
    setData([])
    scanStream.current = null
  })

  const initScanStream = usePersistFn(() => {
    const match = getScanMatch()
    let hashRows: HashRow[] = []
    let index = 1
    scanStream.current = client
      .hscanStream(redisKey, { match, count: pageSize })
      .on('data', (reply) => {
        for (let i = 0; i < reply.length; i += 2) {
          hashRows.push({
            index,
            field: reply[i],
            value: reply[i + 1],
          })
          index++
        }
        setData((preData) => {
          return preData.concat(hashRows)
        })
        hashRows = []
      })
      .on('end', () => {
        setLoading(false)
      })
  })
  const getScanMatch = usePersistFn(() => {
    return filterValue === '' ? '*' : `*${filterValue}*`
  })

  const editLine = usePersistFn(() => {
    if (selectedKey.equals(currentKey) && selectedContent.equals(currentContent)) {
      return false
    }
    client
      .hset(redisKey, currentKey, currentContent)
      .then((reply) => {
        if (!selectedKey.equals(currentKey)) {
          client.hdel(redisKey, selectedKey).then(initShow)
        } else {
          initShow()
        }
        message.success(i18n.$t('modify_success'), 1)
        setSelectedKey(currentKey)
        setSelectedContent(currentContent)
        Promise.resolve().then(() => {
          formatViewRef.current && formatViewRef.current.initShow()
          formatViewKeyRef.current && formatViewKeyRef.current.initShow()
        })
      })
      .catch((e) => {
        message.error(i18n.$t('modify_failed'), 1.5)
      })
  })

  const deleteLine = usePersistFn((record: HashRow) => {
    const delConfirmCols = [
      {
        title: 'row',
        dataIndex: 'index',
        width: 100,
      },
      {
        title: 'Key',
        dataIndex: 'field',
        ellipsis: true,
      },
      {
        title: 'Value',
        dataIndex: 'value',
        ellipsis: true,
      },
    ]
    const modal = Modal.confirm({
      type: 'warning',
      title: i18n.$t('confirm_to_delete_row_data'),
      content: <Table rowKey="value" pagination={false} columns={delConfirmCols} dataSource={[record]} />,
      onOk() {
        client.hdel(redisKey, record.field).then((reply) => {
          message.success(i18n.$t('delete_success'), 1)
          initShow()
        })
      },
      onCancel() {
        modal.destroy()
      },
    })
  })

  const addLine = usePersistFn(() => {
    client
      .hsetnx(redisKey, utils.bufToString(addKey), addContent)
      .then((reply) => {
        if (reply === 1) {
          toggleVisible(false)
          setAddContent(Buffer.from(''))
          setAddKey(Buffer.from(''))
          setCurrentContent(addContent)
          setSelectedContent(addContent)
          setCurrentKey(addKey)
          setSelectedKey(addKey)
          message.success(i18n.$t('add_success'), 1)
          initShow()
        } else if (reply === 0) {
          message.error(i18n.$t('value_exists'))
        }
      })
      .catch((e) => {
        message.error(i18n.$t('add_failed'), 1.5)
      })
  })

  const onClickRow = usePersistFn((record: HashRow, event) => {
    console.log('%c record', 'background: pink; color: #000', record)
    setCurrentContent(Buffer.from(record.value))
    setSelectedContent(Buffer.from(record.value))
    setCurrentKey(Buffer.from(record.field))
    setSelectedKey(Buffer.from(record.field))
    Promise.resolve().then(() => {
      formatViewRef.current && formatViewRef.current.initShow()
    })
  })

  useImperativeHandle(ref, () => ({
    initShow,
  }))

  useMount(() => {
    initShow()
  })

  return (
    <div>
      <div>
        <Button
          type="primary"
          onClick={() => {
            toggleVisible(true)
            setTimeout(() => {
              formatViewRefAdd.current && formatViewRefAdd.current.initShow()
              formatViewRefAddKey.current && formatViewRefAddKey.current.initShow()
            })
          }}
        >
          {i18n.$t('add_new_line')}
        </Button>
        <span className="text-info ml-8">Total: {total} items</span>
      </div>
      <Table
        className="mt-6"
        rowClassName={(record: HashRow) =>
          record.value === utils.bufToString(selectedContent) ? 'ant-table-row-selected' : ''
        }
        pagination={{
          showTotal: () => `Total: ${data.length} lines`,
          showQuickJumper: true,
        }}
        onRow={(record) => ({
          onClick: (event) => onClickRow(record, event),
        })}
        bordered
        size="small"
        loading={loading}
        rowKey="field"
        columns={columns}
        dataSource={data}
      />
      <Space direction="vertical" className="flex">
        <FormatViewer
          prefix="Key："
          ref={formatViewKeyRef}
          content={currentKey}
          setContent={setCurrentKey}
          disabled={false}
        />
        <FormatViewer
          prefix="Value："
          ref={formatViewRef}
          content={currentContent}
          setContent={setCurrentContent}
          disabled={false}
        />
        <Button
          type="primary"
          onClick={editLine}
          disabled={selectedContent.equals(currentContent) && selectedKey.equals(currentKey)}
        >
          {i18n.$t('save')}
        </Button>
      </Space>
      <Modal
        visible={visible}
        onOk={addLine}
        onCancel={() => {
          toggleVisible(false)
        }}
        destroyOnClose={true}
      >
        <Space direction="vertical" className="flex">
          <FormatViewer
            prefix="Key："
            ref={formatViewRefAddKey}
            content={addKey}
            setContent={setAddKey}
            disabled={false}
          />
          <FormatViewer
            prefix="Value："
            ref={formatViewRefAdd}
            content={addContent}
            setContent={setAddContent}
            disabled={false}
          />
        </Space>
      </Modal>
    </div>
  )
}

export const KeyContentHash = forwardRef(KeyContentHashInner)
