import React, { useRef, useState } from 'react'
import { Card, Col, message, Row, Switch, Table, Tag, Tooltip } from 'antd'
import { i18n } from '@/src/i18n/i18n'
import { DatabaseOutlined, InfoCircleFilled, SyncOutlined, WifiOutlined } from '@ant-design/icons'
import { useMount, usePersistFn } from 'ahooks'

const BlockCardGrid = ({ children }: { children: React.ReactNode }) => (
  <Card.Grid style={{ width: '100%' }}>{children}</Card.Grid>
)

interface RedisStatusProps {
  client: IORedisClient
}

const allInfoColumns = [
  {
    title: 'Key',
    dataIndex: 'key',
  },
  {
    title: 'Value',
    dataIndex: 'value',
  },
]

const keyStatisticsColumns = [
  {
    title: 'DB',
    dataIndex: 'db',
  },
  {
    title: 'Keys',
    dataIndex: 'keys',
    sorter: {
      compare: (a: AnyObj, b: AnyObj) => a.keys - b.keys,
      multiple: 3,
    },
  },
  {
    title: 'Expires',
    dataIndex: 'expires',
    sorter: {
      compare: (a: AnyObj, b: AnyObj) => a.expires - b.expires,
      multiple: 2,
    },
  },
  {
    title: 'Avg TTL',
    dataIndex: 'avg_ttl',
    sorter: {
      compare: (a: AnyObj, b: AnyObj) => a.avg_ttl - b.avg_ttl,
      multiple: 1,
    },
  },
]

export function RedisStatus({ client }: RedisStatusProps): JSX.Element {
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [autoRefreshInterval] = useState<number>(2000)
  const [connectionStatus, setConnectionStatus] = useState<AnyObj>({})
  const [allRedisInfo, setAllRedisInfo] = useState([])
  const [dbKeys, setDbKeys] = useState([])
  const refreshTimer = useRef<number | undefined>()

  const initStatus = usePersistFn(
    (content): AnyObj => {
      if (!content) {
        return {}
      }
      const contentNext = content.split('\n')
      const lines = {}
      const allInfo = []
      const dbs = []

      for (let i of contentNext) {
        i = i.replace(/\s/gi, '')
        if (i.startsWith('#') || !i) continue

        const [k, v] = i.split(':')
        lines[k] = v
        allInfo.push({
          key: k,
          value: v,
        })
        if (k.startsWith('db')) {
          const [keys, expires, avg_ttl] = v.split(',').map((item: string) => item.split('=')[1])
          dbs.push({
            db: k,
            keys,
            expires,
            avg_ttl,
            key: k,
          })
        }
      }
      return { lines, allInfo, dbs }
    }
  )

  const initShow = usePersistFn(() => {
    client
      .info()
      .then((reply) => {
        const { lines, allInfo, dbs } = initStatus(reply)
        setConnectionStatus(lines)
        setAllRedisInfo(allInfo)
        setDbKeys(dbs)
      })
      .catch((e) => {
        if (e.message.includes('ERR unknown command')) {
          message.error({
            content: i18n.$t('info_disabled'),
            duration: 3,
          })
        }
      })
  })
  const refreshInit = usePersistFn((autoRefresh = false) => {
    if (refreshTimer.current) {
      clearInterval(refreshTimer.current)
    }
    if (autoRefresh) {
      initShow()
      // @ts-ignore
      refreshTimer.current = setInterval(initShow, autoRefreshInterval)
    }
  })

  useMount(() => {
    initShow()
    refreshInit()
  })

  return (
    <>
      {/*auto refresh row*/}
      <Row justify="end">
        <Col>
          <Tag>
            <SyncOutlined spin={autoRefresh} />
            {i18n.$t('auto_refresh')}
          </Tag>
          <Tooltip
            placement="bottomLeft"
            title={i18n.$f('auto_refresh_tip', { interval: autoRefreshInterval / 1000 })}
          >
            <Switch
              onChange={(autoRefresh) => {
                refreshInit(autoRefresh)
                setAutoRefresh(autoRefresh)
              }}
            />
          </Tooltip>
        </Col>
      </Row>
      <br />
      {/*brief info row*/}
      <Row gutter={16}>
        {/*server status*/}
        <Col span={8}>
          <Card
            title={
              <div>
                <DatabaseOutlined />
                {i18n.$t('server')}
              </div>
            }
          >
            <BlockCardGrid>
              {i18n.$t('redis_version')}：<Tag>{connectionStatus.redis_version}</Tag>
            </BlockCardGrid>
            <BlockCardGrid>
              OS：<Tag>{connectionStatus.os}</Tag>
            </BlockCardGrid>
            <BlockCardGrid>
              {i18n.$t('process_id')}：<Tag>{connectionStatus.process_id}</Tag>
            </BlockCardGrid>
          </Card>
        </Col>
        {/*memory info*/}
        <Col span={8}>
          <Card
            title={
              <div className="flex center-v">
                <i className="ri-database-2-fill"></i>
                {i18n.$t('memory')}
              </div>
            }
          >
            <BlockCardGrid>
              {i18n.$t('used_memory')}：<Tag>{connectionStatus.used_memory_human}</Tag>
            </BlockCardGrid>
            <BlockCardGrid>
              {i18n.$t('used_memory_peak')}：<Tag>{connectionStatus.used_memory_peak_human}</Tag>
            </BlockCardGrid>
            <BlockCardGrid>
              {i18n.$t('used_memory_lua')}：<Tag>{connectionStatus.used_memory_lua / 1024}k</Tag>
            </BlockCardGrid>
          </Card>
        </Col>
        {/*stats row*/}
        <Col span={8}>
          <Card
            title={
              <div>
                <WifiOutlined />
                {i18n.$t('stats')}
              </div>
            }
          >
            <BlockCardGrid>
              {i18n.$t('connected_clients')}：<Tag>{connectionStatus.connected_clients}</Tag>
            </BlockCardGrid>
            <BlockCardGrid>
              {i18n.$t('total_connections_received')}：<Tag>{connectionStatus.total_connections_received}</Tag>
            </BlockCardGrid>
            <BlockCardGrid>
              {i18n.$t('total_commands_processed')}：<Tag>{connectionStatus.total_commands_processed}</Tag>
            </BlockCardGrid>
          </Card>
        </Col>
      </Row>
      <br />

      {/*key statistics*/}

      <Table
        pagination={false}
        title={() => (
          <div className="flex center-v">
            <i className="ri-bar-chart-2-line"></i>
            {i18n.$t('key_statistics')}
          </div>
        )}
        columns={keyStatisticsColumns}
        dataSource={dbKeys}
        bordered
      />
      <br />

      {/*all redis info table*/}

      <Table
        pagination={false}
        title={() => (
          <div>
            <InfoCircleFilled />
            {i18n.$t('all_redis_info')}
          </div>
        )}
        columns={allInfoColumns}
        dataSource={allRedisInfo}
        bordered
      />
    </>
  )
}
