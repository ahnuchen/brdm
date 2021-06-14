import React, { forwardRef, Ref, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useMount, usePersistFn, useToggle } from 'ahooks'
import { Readable } from 'stream'
import { Button, Form, Input, InputNumber, message, Modal, Space, Table } from 'antd'
import { i18n } from '@/src/i18n/i18n'
import { DeleteFilled, SearchOutlined } from '@ant-design/icons'
import utils from '@/src/common/utils'
import { FormatViewer } from '@/src/components/format-viewer'
interface KeyContentZsetProps {
  client: IORedisClient
  redisKey: string
}

interface ZSetRow {
  value: any
  index: number
  score: number
}

export function KeyContentZsetInner(
  { client, redisKey }: KeyContentZsetProps,
  ref: Ref<ForwardRefProps>
): JSX.Element {
  const scanStream = useRef<Readable | null>(null)
  const pageSize = 1000
  const [data, setData] = useState<ZSetRow[]>([])
  const [total, setTotal] = useState(0)
  const [filterValue, setFilterValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentContent, setCurrentContent] = useState<Buffer>(Buffer.from(''))
  const [selectedContent, setSelectedContent] = useState<Buffer>(Buffer.from(''))
  const [currentScore, setCurrentScore] = useState<number | undefined>()
  const [selectedScore, setSelectedScore] = useState<number | undefined>()
  const formatViewRef = useRef<ForwardRefProps>(null)
  const formatViewRefAdd = useRef<ForwardRefProps>(null)
  const [addContent, setAddContent] = useState(Buffer.from(''))
  const [addScore, setAddScore] = useState<number | undefined>()
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
          compare(a: ZSetRow, b: ZSetRow) {
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
        dataIndex: 'value',
        ellipsis: true,
        sorter: {
          compare(a: ZSetRow, b: ZSetRow) {
            return a.value.localeCompare(b.value)
          },
          multiple: 1,
        },
      },
      {
        title: 'Score',
        dataIndex: 'score',
        sorter: {
          compare(a: ZSetRow, b: ZSetRow) {
            return a.score - b.score
          },
          multiple: 1,
        },
      },
      {
        title: 'Action',
        key: 'action',
        width: 100,
        render: (record: ZSetRow) => (
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
    client.zcard(redisKey).then((res) => {
      setTotal(res)
    })
  })

  const resetTable = usePersistFn(() => {
    setData([])
    scanStream.current = null
  })

  const initScanStream = usePersistFn(() => {
    const match = getScanMatch()

    let zSets: ZSetRow[] = []
    let index = 1
    scanStream.current = client.zscanStream(redisKey, { match, count: pageSize }).on('data', (reply) => {
      for (let i = 0; i < reply.length; i += 2) {
        zSets.push({
          index,
          value: reply[i],
          score: reply[i + 1],
        })
        index++
      }
      setData((preData) => {
        return preData.concat(zSets)
      })
      zSets = []
    })

    scanStream.current?.on('end', () => {
      setLoading(false)
    })
  })
  const getScanMatch = usePersistFn(() => {
    return filterValue === '' ? '*' : `*${filterValue}*`
  })

  const editLine = usePersistFn(() => {
    if (selectedContent.equals(currentContent) && selectedScore === currentScore) {
      return false
    }
    client
      .zrem(redisKey, selectedContent)
      .then((reply) => {
        client.zadd(redisKey, currentScore || 0, currentContent).then((reply) => {
          console.log('%c zadd', 'background: black; color: white', reply)
          initShow()
          message.success(i18n.$t('modify_success'), 1)
          setSelectedContent(currentContent)
          setSelectedScore(currentScore)
          Promise.resolve().then(() => {
            formatViewRef.current && formatViewRef.current.initShow()
          })
        })
      })
      .catch((e) => {
        message.error(e.message, 1.5)
      })
  })

  const deleteLine = usePersistFn((record: ZSetRow) => {
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
      {
        title: 'Score',
        dataIndex: 'score',
        width: 100,
      },
    ]
    const modal = Modal.confirm({
      type: 'warning',
      title: i18n.$t('confirm_to_delete_row_data'),
      content: <Table rowKey="value" pagination={false} columns={delConfirmCols} dataSource={[record]} />,
      onOk() {
        client
          .zrem(redisKey, record.value)
          .then((reply) => {
            if (reply === 1) {
              message.success(i18n.$t('delete_success'), 1)
              initShow()
            } else {
              message.success(i18n.$t('delete_failed'), 1)
            }
          })
          .catch((e) => {
            message.success(e.message, 1.5)
          })
      },
      onCancel() {
        modal.destroy()
      },
    })
  })

  const addLine = usePersistFn(() => {
    let score = addScore
    if (!score) {
      score = 0
    }
    client
      .zadd(redisKey, score, addContent)
      .then((reply) => {
        toggleVisible(false)
        setAddContent(Buffer.from(''))
        setCurrentContent(addContent)
        setSelectedContent(addContent)
        setSelectedScore(score as number)
        setCurrentScore(score as number)
        message.success(i18n.$t('add_success'), 1)
        initShow()
      })
      .catch((e) => {
        message.error(e.message, 1.5)
      })
  })

  const onClickRow = usePersistFn((record: ZSetRow, event) => {
    const v = Buffer.from(record.value)
    setCurrentContent(v)
    setSelectedContent(v)
    setCurrentScore(record.score)
    setSelectedScore(record.score)
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
        rowClassName={(record: ZSetRow) =>
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
      <Space direction="vertical" className="flex">
        <Form.Item label="Score：">
          <InputNumber
            style={{ width: '100%' }}
            onChange={(e: number) => setCurrentScore(e)}
            value={currentScore}
          />
        </Form.Item>
        <FormatViewer
          prefix="Value："
          ref={formatViewRef}
          content={currentContent}
          setContent={setCurrentContent}
          disabled={false}
        />
        <Button
          type="primary"
          className="mt-4"
          onClick={editLine}
          disabled={selectedContent.equals(currentContent) && selectedScore === currentScore}
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
          <Form.Item label="Score：">
            <InputNumber style={{ width: '100%' }} onChange={(e: number) => setAddScore(e)} value={addScore} />
          </Form.Item>
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

export const KeyContentZset = forwardRef(KeyContentZsetInner)
