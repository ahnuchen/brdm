import React, { forwardRef, Ref, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useMount, usePersistFn, useToggle } from 'ahooks'
import { Button, List, message, Modal, Table, Input } from 'antd'
import { Readable } from 'stream'
import { DeleteColumnOutlined, DeleteFilled, DeleteRowOutlined, SearchOutlined } from '@ant-design/icons'
import { i18n } from '@/src/i18n/i18n'
import SplitPane from 'react-split-pane'
import { FormatViewer } from '@/src/components/format-viewer'
import utils from '@/src/common/utils'
import Mousetrap from 'mousetrap'

interface KeyContentSetProps {
  client: IORedisClient
  redisKey: string
}

interface SetRow {
  value: any
  index: number
}

export function KeyContentSetInner(
  { client, redisKey }: KeyContentSetProps,
  ref: Ref<ForwardRefProps>
): JSX.Element {
  const scanStream = useRef<Readable | null>(null)
  const pageSize = 1000
  const [data, setData] = useState<SetRow[]>([])
  const [total, setTotal] = useState(0)
  const [filterValue, setFilterValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentContent, setCurrentContent] = useState<Buffer>(Buffer.from(''))
  const [selectedContent, setSelectedContent] = useState<Buffer>(Buffer.from(''))
  const formatViewRef = useRef<ForwardRefProps>(null)
  const formatViewRefAdd = useRef<ForwardRefProps>(null)
  const [addContent, setAddContent] = useState(Buffer.from(''))
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
          compare(a: SetRow, b: SetRow) {
            return a.index - b.index
          },
          multiple: 3,
        },
      },
      {
        title: (
          <div className="flex center-v">
            value
            <Input
              style={{ width: '60%' }}
              onInput={(event) => {
                setFilterValue(event.currentTarget.value)
              }}
              onClick={(e) => e.stopPropagation()}
              onPressEnter={initShow}
              suffix={
                <SearchOutlined
                  onClick={(e) => {
                    e.stopPropagation()
                    initShow()
                  }}
                />
              }
              className="ml-8"
              placeholder={i18n.$t('key_to_search')}
            />
          </div>
        ),
        dataIndex: 'value',
        ellipsis: true,
        sorter: {
          compare(a: SetRow, b: SetRow) {
            return a.value.localeCompare(b.value)
          },
          multiple: 2,
        },
      },
      {
        title: 'Action',
        key: 'action',
        width: 100,
        render: (record: SetRow) => (
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
    client.scard(redisKey).then((res) => {
      setTotal(res)
    })
  })

  const resetTable = usePersistFn(() => {
    setData([])
    scanStream.current = null
  })

  const initScanStream = usePersistFn(() => {
    const match = getScanMatch()
    scanStream.current = client.sscanStream(redisKey, { match, count: pageSize })

    let sets: SetRow[] = []
    let index = 1
    scanStream.current?.on('data', (reply) => {
      for (const value of reply) {
        sets.push({
          value,
          index: index++,
        })
      }
      setData((preData) => {
        return preData.concat(sets)
      })
      sets = []
    })

    scanStream.current?.on('end', () => {
      setLoading(false)
    })
  })
  const getScanMatch = usePersistFn(() => {
    return filterValue === '' ? '*' : `*${filterValue}*`
  })

  const editLine = usePersistFn(() => {
    if (selectedContent === currentContent) {
      return false
    }
    client.sadd(redisKey, currentContent).then((reply) => {
      if (reply === 1) {
        if (selectedContent) {
          client.srem(redisKey, selectedContent).then(initShow)
        } else {
          initShow()
        }
        message.success(i18n.$t('modify_success'), 1)
        setSelectedContent(currentContent)
        Promise.resolve().then(() => {
          formatViewRef.current && formatViewRef.current.initShow()
        })
      } else if (reply === 0) {
        message.error(i18n.$t('value_exists'), 1.5)
      }
    })
  })

  const deleteLine = usePersistFn((record: SetRow) => {
    const delConfirmCols = [
      {
        title: 'row',
        dataIndex: 'index',
        width: 100,
      },
      {
        title: 'value',
        dataIndex: 'value',
        ellipsis: true,
      },
    ]
    const modal = Modal.confirm({
      type: 'warning',
      title: i18n.$t('confirm_to_delete_row_data'),
      content: <Table rowKey="value" pagination={false} columns={delConfirmCols} dataSource={[record]} />,
      onOk() {
        client.srem(redisKey, record.value).then((reply) => {
          if (reply === 1) {
            message.success(i18n.$t('delete_success'), 1)
          }
          initShow()
        })
      },
      onCancel() {
        modal.destroy()
      },
    })
  })

  const addLine = usePersistFn(() => {
    client.sadd(redisKey, addContent).then((reply) => {
      if (reply === 1) {
        toggleVisible(false)
        setAddContent(Buffer.from(''))
        setCurrentContent(addContent)
        setSelectedContent(addContent)
        message.success(i18n.$t('add_success'), 1)
        initShow()
      } else if (reply === 0) {
        message.error(i18n.$t('value_exists'), 1.5)
      }
    })
  })

  const onClickRow = usePersistFn((record: SetRow, event) => {
    const v = Buffer.from(record.value)
    setCurrentContent(v)
    setSelectedContent(v)
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
            })
          }}
        >
          {i18n.$t('add_new_line')}
        </Button>
        <span className="text-info ml-8">Total: {total} items</span>
      </div>
      <Table
        className="mt-6"
        rowClassName={(record: SetRow) =>
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
        rowKey="value"
        columns={columns}
        dataSource={data}
      />
      <FormatViewer
        ref={formatViewRef}
        content={currentContent}
        setContent={setCurrentContent}
        disabled={false}
      />
      <Button
        type="primary"
        className="mt-4"
        onClick={editLine}
        disabled={selectedContent.equals(currentContent)}
      >
        {i18n.$t('save')}
      </Button>
      <Modal
        visible={visible}
        onOk={addLine}
        onCancel={() => {
          toggleVisible(false)
        }}
        destroyOnClose={true}
      >
        <FormatViewer ref={formatViewRefAdd} content={addContent} setContent={setAddContent} disabled={false} />
      </Modal>
    </div>
  )
}

export const KeyContentSet = forwardRef(KeyContentSetInner)
