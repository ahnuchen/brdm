import React, { forwardRef, Ref, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useMount, usePersistFn, useToggle } from 'ahooks'
import { Button, Input, message, Modal, Table } from 'antd'
import { i18n } from '@/src/i18n/i18n'
import { DeleteFilled } from '@ant-design/icons'
import utils from '@/src/common/utils'
import { FormatViewer } from '@/src/components/format-viewer'
import { Readable } from 'stream'

interface KeyContentListProps {
  client: IORedisClient
  redisKey: string
}

interface ListRow {
  key: number
  index: number
  value: any
  valueDisplay: string
}

export function KeyContentListInner(
  { client, redisKey }: KeyContentListProps,
  ref: Ref<ForwardRefProps>
): JSX.Element {
  const [total, setTotal] = useState(0)
  const [data, setData] = useState<ListRow[]>([])
  const start = useRef(0)
  const pageSize = 200
  const [loading, setLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [currentContent, setCurrentContent] = useState<Buffer>(Buffer.from(''))
  const [selectedContent, setSelectedContent] = useState<Buffer>(Buffer.from(''))
  const formatViewRef = useRef<ForwardRefProps>(null)
  const formatViewRefAdd = useRef<ForwardRefProps>(null)
  const [addContent, setAddContent] = useState(Buffer.from(''))
  const [visible, { toggle: toggleVisible }] = useToggle(false)

  const columns = useMemo(
    () => [
      {
        title: 'row',
        dataIndex: 'index',
        width: 100,
        sorter: {
          compare(a: ListRow, b: ListRow) {
            return a.index - b.index
          },
          multiple: 3,
        },
      },
      {
        title: 'value',
        dataIndex: 'valueDisplay',
        ellipsis: true,
        sorter: {
          compare(a: ListRow, b: ListRow) {
            return a.valueDisplay.localeCompare(b.valueDisplay)
          },
          multiple: 2,
        },
      },
      {
        title: 'Action',
        key: 'action',
        width: 100,
        render: (record: ListRow) => (
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

  const initShow = usePersistFn(() => {
    resetData()
    Promise.resolve().then(() => {
      initTotal()
      initData()
    })
  })

  const initData = usePersistFn(() => {
    let listIndex = 0
    const list: ListRow[] = []
    setLoading(true)
    function scanList() {
      client
        .lrangeBuffer(redisKey, start.current, start.current + pageSize)
        .then((res) => {
          for (const re of res) {
            listIndex++
            list.push({
              index: listIndex,
              key: listIndex,
              value: re,
              valueDisplay: utils.bufToString(re),
            })
          }

          if (res.length >= pageSize) {
            start.current = start.current + pageSize + 1
            scanList()
          } else {
            setData(list)
            setLoading(false)
          }
        })
        .catch((e) => {
          message.error(e.message)
          setLoading(false)
        })
    }
    scanList()
  })

  const initTotal = usePersistFn(() => {
    client.llen(redisKey).then((res) => {
      setTotal(res)
    })
  })

  const resetData = usePersistFn(() => {
    start.current = 0
    setData([])
  })

  const addLine = usePersistFn(() => {
    client
      .lpush(redisKey, addContent)
      .then((reply) => {
        if (reply > 0) {
          toggleVisible(false)
          setAddContent(Buffer.from(''))
          setCurrentIndex(0)
          setCurrentContent(addContent)
          message.success(i18n.$t('add_success'), 1)
          initShow()
        }
      })
      .catch((e) => {
        message.error(i18n.$t('add_failed'))
      })
  })

  const onClickRow = usePersistFn((record: ListRow) => {
    const v = Buffer.from(record.value)
    setCurrentContent(v)
    setSelectedContent(v)
    setCurrentIndex(record.index - 1)
    Promise.resolve().then(() => {
      formatViewRef.current && formatViewRef.current.initShow()
    })
  })

  const editLine = usePersistFn(() => {
    if (selectedContent === currentContent) {
      return false
    }
    client
      .lset(redisKey, currentIndex, currentContent)
      .then((res) => {
        if (res === 'OK') {
          message.success(i18n.$t('modify_success'), 1)
          setSelectedContent(currentContent)
          initShow()
          Promise.resolve().then(() => {
            formatViewRef.current && formatViewRef.current.initShow()
          })
        } else {
          message.error(i18n.$t('modify_failed'), 1.5)
        }
      })
      .catch((e) => {
        message.error(e.message, 1.5)
      })
  })

  const deleteLine = usePersistFn((record: ListRow) => {
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
        render: (value: ListRow['value']) => utils.bufToString(value),
      },
    ]
    const modal = Modal.confirm({
      type: 'warning',
      title: i18n.$t('confirm_to_delete_row_data'),
      content: <Table rowKey="value" pagination={false} columns={delConfirmCols} dataSource={[record]} />,
      onOk() {
        const tempValue = '---VALUE_REMOVED_BY_BRDM---'
        client
          .lset(redisKey, record.index - 1, tempValue)
          .then((res) => {
            if (res === 'OK') {
              client
                .lrem(redisKey, 1, tempValue)
                .then((reply) => {
                  if (reply === 1) {
                    message.success(i18n.$t('delete_success'), 1)
                  }
                  if (record.index - 1 < currentIndex) {
                    setCurrentIndex((i) => i - 1)
                  }
                  initShow()
                })
                .catch((e) => {
                  message.error(e.message, 1.5)
                })
            } else {
              message.error(i18n.$t('delete_failed'), 1.5)
            }
          })
          .catch((e) => {
            message.error(e.message, 1.5)
          })
      },
      onCancel() {
        modal.destroy()
      },
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
        rowClassName={(record) => (record.index - 1 === currentIndex ? 'ant-table-row-selected' : '')}
        pagination={{
          showTotal: () => `Total: ${data.length} lines`,
          showQuickJumper: true,
        }}
        onRow={(record) => ({
          onClick: (event) => onClickRow(record),
        })}
        bordered
        size="small"
        loading={loading}
        rowKey="key"
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
        disabled={selectedContent.equals(currentContent) || currentIndex < 0}
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

export const KeyContentList = forwardRef(KeyContentListInner)
