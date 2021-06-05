import React, { useState } from 'react'
import './right-tabs.less'
import { message, Tabs } from 'antd'
import { InfoCircleOutlined, KeyOutlined } from '@ant-design/icons'
import { useMount, usePersistFn } from 'ahooks'
import utils from '@/src/common/utils'
import { i18n } from '@/src/i18n/i18n'
import { $bus, EventTypes } from '@/src/common/emitter'

const { TabPane } = Tabs

interface TabPaneItem {
  title: string
  key: string
  redisKey: string
  tabType: string
  keyType: string
  client: IORedisClient
}

export function RightTabs(): JSX.Element {
  const [tabs, setTabs] = useState<TabPaneItem[]>([])
  const [activeKey, setActiveKey] = useState('1')

  const onEdit = usePersistFn((targetKey, action) => {
    if (action === 'remove') {
      removeTab(targetKey)
    }
  })

  const addTab = usePersistFn((newTabItem, newTab = false) => {
    const exists = tabs.some((item) => item.key === newTabItem.key)

    if (exists) {
      return setActiveKey(newTabItem.key)
    }

    if (newTab) {
      setTabs((tabs) => {
        tabs.push(newTabItem)
        return tabs
      })
    } else {
      let replaced = false

      const nextTabs = tabs.map((item) => {
        if (item.key === activeKey && item.tabType === 'key') {
          replaced = true
          return newTabItem
        }
        return item
      })

      if (replaced) {
        setTabs(nextTabs)
      } else {
        setTabs((tabs) => {
          tabs.push(newTabItem)
          return tabs
        })
      }
    }
    setActiveKey(newTabItem.key)
  })

  const removeTab = usePersistFn((targetKey) => {
    let nextActiveTab: TabPaneItem

    if (activeKey === targetKey) {
      tabs.forEach((tab, index) => {
        if (tab.key === targetKey) {
          nextActiveTab = tabs[index + 1] || tabs[index - 1]
        }
      })
    }
    setTabs((tabs) => tabs.filter((t) => t.key !== targetKey))
    // @ts-ignore
    if (nextActiveTab && nextActiveTab.key) {
      setActiveKey(() => nextActiveTab.key)
    }
  })

  const onChange = usePersistFn((activeKey) => {
    setActiveKey(activeKey)
  })

  const initKeyTabItem = usePersistFn((client, key, type) => {
    // @ts-ignore
    const dbIndex = client.condition?.select || 0
    const { connectionName } = client.options

    const title = `${utils.cutString(utils.bufToString(key))} | ${utils.bufToString(
      connectionName
    )} | DB${dbIndex}`

    const keyStr = `${key} | ${connectionName} | DB${dbIndex}`
    return {
      title,
      key: keyStr,
      redisKey: key,
      tabType: 'key',
      keyType: type,
      client,
    }
  })

  const addKeyTab = usePersistFn((client: IORedisClient, key, newTab = false) => {
    client.type(key).then((type) => {
      if (type === 'none') {
        message.error({
          content: `${key} ${i18n.$t('key_not_exists')}`,
        })
        return
      }
      addTab(initKeyTabItem(client, key, type), newTab)
    })
  })
  const getIconByTabType = usePersistFn((tab) => {
    switch (tab.tabType) {
      case 'key': {
        return <KeyOutlined />
      }
      case 'status': {
        return <InfoCircleOutlined />
      }
    }
  })

  useMount(() => {
    $bus.on(EventTypes.ClickedKey, (client, key, newTab = false) => {
      addKeyTab(client as IORedisClient, key, newTab)
    })
  })

  return (
    <Tabs type="editable-card" activeKey={activeKey} hideAdd onChange={onChange} onEdit={onEdit}>
      {tabs.map((tab) => (
        <TabPane
          tab={
            <span>
              {getIconByTabType(tab)}
              {tab.title}
            </span>
          }
          key={tab.key}
          closable={true}
        >
          {tab.title}
        </TabPane>
      ))}
    </Tabs>
  )
}
