import React, { Dispatch, forwardRef, Ref, SetStateAction, useImperativeHandle, useState } from 'react'
import { useMount, usePersistFn } from 'ahooks'
import { Button, Checkbox, Divider, Form, Input, message, Modal, Row, Select, Tooltip } from 'antd'
import { encode } from '@msgpack/msgpack'
import { $bus, EventTypes } from '@/src/common/emitter'
import { PlusOutlined } from '@ant-design/icons'
import { i18n } from '@/src/i18n/i18n'
import { RedisKeyTypes } from '@/src/common/redisKeyTypes'

interface OperateItemInnerProps {
  client: IORedisClient
  opening: boolean
  exactSearch: boolean
  match: string
  setExactSearch: Dispatch<SetStateAction<boolean>>
  setMatch: Dispatch<SetStateAction<string>>
}

function OperateItemInner(
  { client, opening, exactSearch, match, setExactSearch, setMatch }: OperateItemInnerProps,
  ref: Ref<any>
): JSX.Element {
  const [dbs, setDbs] = useState<number[]>([0])
  const [newKeyDialog, setnewKeyDialog] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [selectedNewKeyType, setSelectedNewKeyType] = useState('string')
  const [selectedDbIndex, setSelectedDbIndex] = useState(0)
  const initShow = usePersistFn(() => {
    initDatabaseSelect()
  })
  const initDatabaseSelect = usePersistFn(() => {
    client
      .config('GET', 'databases')
      .then((reply) => {
        console.log('%c reply', 'background: black; color: white', reply, client)
        setDbs([...Array(parseInt(reply[1])).keys()])
      })
      .catch((e) => {
        // config command may be renamed
        setDbs([...Array(16).keys()])
        // read dbs from info
        getDatabasesFromInfo()
      })
  })

  const getDatabasesFromInfo = usePersistFn(() => {
    if (!client) {
      return
    }

    client
      .info()
      .then((info) => {
        try {
          // @ts-ignore
          const lastDB = info
            .trim()
            .split('\n')
            .pop()
            ?.match(/db(\d+)/)[1] as string
          const lastDBNum = parseInt(lastDB)

          if (lastDBNum > 16) {
            setDbs([...Array(lastDB + 1).keys()])
          }
        } catch (e) {}
      })
      .catch(() => {})
  })
  const resetStatus = usePersistFn(() => {
    setDbs([0])
    setSelectedDbIndex(0)
    setMatch('')
    setExactSearch(false)
  })

  const changeDb = (dbIndex: number) => {
    setSelectedDbIndex(dbIndex)
    client
      .select(dbIndex)
      .then(() => {
        console.log('%c client', 'background: pink; color: #000')
        $bus.emit(EventTypes.RefreshKeyList, client)
      })
      // select is not allowed in cluster mode
      .catch((e) => {
        message.error(e.message, 3)

        // reset to db0
        setSelectedDbIndex(() => 0)
      })
  }

  const addNewKey = usePersistFn(() => {
    if (!newKeyName) {
      return
    }

    // key to buffer
    const key = Buffer.from(newKeyName)

    const promise = setDefaultValue(key, selectedNewKeyType) as Promise<any>

    promise.then(() => {
      $bus.emit(EventTypes.RefreshKeyList, client, key, 'add')
      $bus.emit(EventTypes.ClickedKey, client, key, true)
    })

    setnewKeyDialog(false)
  })

  const object = {
    nil: null,
    integer: 333,
    float: Math.PI,
    string: 'Hello, world!',
    binary: Uint8Array.from([1, 2, 3]),
    array: [13, '20', false],
    map: { foo: 'bar' },
    timestampExt: new Date(),
  }

  const encoded: Uint8Array = encode(object)

  const setDefaultValue = usePersistFn((key, type) => {
    switch (type) {
      case 'string': {
        return client.set(key, Buffer.from(encoded))
      }
      case 'hash': {
        return client.hset(key, 'New field', 'New value')
      }
      case 'list': {
        return client.lpush(key, 'New member')
      }
      case 'set': {
        return client.sadd(key, 'New member')
      }
      case 'zset': {
        return client.zadd(key, 0, 'New member')
      }
      case 'stream': {
        return client.xadd(key, '*', 'New key', 'New value')
      }
    }
  })

  const changeMatchMode = usePersistFn(() => {
    if (!opening) {
      $bus.emit(EventTypes.RefreshKeyList, client)
    }
  })

  useImperativeHandle(ref, () => ({
    initShow,
  }))

  useMount(() => {
    $bus.on(EventTypes.ChangeDb, (c, dbIndex) => {
      if (c !== client) {
        return 0
      }
      changeDb(dbIndex)
    })
  })

  return (
    <div>
      <Row className="flex center">
        <Select showSearch className="flex-1" onChange={changeDb} defaultValue={dbs[0]}>
          {dbs.map((db) => (
            <Select.Option key={db} value={db}>
              db{db}
            </Select.Option>
          ))}
        </Select>
        <Button className="flex-1" onClick={() => setnewKeyDialog(true)}>
          <PlusOutlined />
          {i18n.$t('add_new_key')}
        </Button>
      </Row>
      <Input.Search
        onPressEnter={changeMatchMode}
        onSearch={changeMatchMode}
        style={{ marginTop: 4 }}
        onChange={(e) => setMatch(e.currentTarget.value)}
        placeholder={i18n.$t('enter_to_search')}
        loading={opening}
        suffix={
          <Tooltip title={i18n.$t('exact_search')}>
            <Checkbox onChange={(e) => setExactSearch(e.target.checked)} checked={exactSearch} />
          </Tooltip>
        }
      />
      <Modal
        destroyOnClose={true}
        title={i18n.$t('add_new_key')}
        onOk={addNewKey}
        visible={newKeyDialog}
        onCancel={() => setnewKeyDialog(false)}
      >
        <Form>
          <Form.Item label={i18n.$t('key_name')}>
            <Input
              autoFocus={true}
              onInput={(v) => {
                setNewKeyName(v.currentTarget.value)
              }}
            />
          </Form.Item>
          <Form.Item label={i18n.$t('key_type')}>
            <Select onChange={setSelectedNewKeyType} defaultValue={RedisKeyTypes.string}>
              {Object.keys(RedisKeyTypes).map((keyType) => (
                <Select.Option key={keyType} value={keyType}>
                  {keyType}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export const OperateItem = forwardRef(OperateItemInner)
