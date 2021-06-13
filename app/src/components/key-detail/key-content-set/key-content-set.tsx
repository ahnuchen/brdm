import React, { forwardRef, Ref, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useMount, usePersistFn } from 'ahooks'
import { Button, List, message, Modal, Table, Input } from 'antd'
import { Readable } from 'stream'
import { DeleteColumnOutlined, DeleteFilled, DeleteRowOutlined } from '@ant-design/icons'
import { i18n } from '@/src/i18n/i18n'
import SplitPane from 'react-split-pane'
import { FormatViewer } from '@/src/components/format-viewer'
import utils from '@/src/common/utils'

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

  const initShow = usePersistFn((reset = true, showToast = true) => {
    initTotal(showToast)
    if (reset) {
      resetTable()
      Promise.resolve().then(initScanStream)
    } else {
      initScanStream()
    }
  })

  const columns = useMemo(
    () => [
      {
        title: 'row',
        dataIndex: 'index',
        width: 100,
      },
      {
        title: (
          <div className="flex center-v">
            value
            <Input.Search
              onInput={(event) => {
                setFilterValue(event.currentTarget.value)
              }}
              onSearch={() => initShow(true, false)}
              onPressEnter={() => initShow(true, false)}
              className="ml-8"
              placeholder={i18n.$t('key_to_search')}
            />
          </div>
        ),
        dataIndex: 'value',
        ellipsis: true,
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

  const initTotal = usePersistFn((showToast) => {
    client.scard(redisKey).then((res) => {
      setTotal(res)
      if (showToast) {
        message.destroy()
        message.info(`Total: ${res} items`, 1)
      }
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
    client.sadd(redisKey, currentContent).then((reply) => {
      if (reply === 1) {
        if (selectedContent) {
          client.srem(redisKey, selectedContent).then(initShow)
        } else {
          initShow
        }
        message.success(i18n.$t('add_success'), 1)
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
    const modal = Modal.confirm({
      type: 'warning',
      title: i18n.$t('confirm_to_delete_row_data'),
      content: (
        <Table rowKey="value" pagination={false} columns={[columns[0], columns[1]]} dataSource={[record]} />
      ),
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

  const addLine = usePersistFn(async () => {
    // todo test code
    // const i = '0'
    //   .repeat(20000)
    //   .split('')
    //   .map((item, index) => index)
    // for (const iElement of i) {
    //   await client.sadd(redisKey, i)
    // }
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
      <Button onClick={addLine}>添加一行</Button>
      <Table
        rowClassName={(record: SetRow) =>
          record.value === utils.bufToString(selectedContent) ? 'ant-table-row-selected' : ''
        }
        pagination={{
          showTotal: () => `Total: ${data.length} items`,
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
      {utils.bufToString(selectedContent) && (
        <>
          <FormatViewer
            ref={formatViewRef}
            content={currentContent}
            setContent={setCurrentContent}
            disabled={false}
          />
          <Button onClick={editLine} disabled={selectedContent === currentContent}>
            {i18n.$t('save')}
          </Button>
        </>
      )}
    </div>
  )
}

export const KeyContentSet = forwardRef(KeyContentSetInner)
