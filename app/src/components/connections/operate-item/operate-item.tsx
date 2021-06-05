import React, { forwardRef, Ref, useImperativeHandle, useState } from 'react'
import { useMount, usePersistFn } from 'ahooks'
import { message } from 'antd'
import { $bus, EventTypes } from '@/src/common/emitter'

interface OperateItemInnerProps {
  client: IORedisClient
}

function OperateItemInner({ client }: OperateItemInnerProps, ref: Ref<any>): JSX.Element {
  const [dbs, setdbs] = useState([0])
  const [searchExact, setsearchExact] = useState(false)
  const [newKeyDialog, setnewKeyDialog] = useState(false)
  const [searchMatch, setsearchMatch] = useState('')
  const [newKeyName, setnewKeyName] = useState('')
  const [selectedNewKeyType, setselectedNewKeyType] = useState('string')
  const [selectedDbIndex, setselectedDbIndex] = useState(0)
  const initShow = usePersistFn(() => {
    initDatabaseSelect()
  })
  const initDatabaseSelect = usePersistFn(() => {
    client
      .config('GET', 'databases')
      .then((reply) => {
        console.log('%c reply', 'background: black; color: white', reply, client)
        setdbs([...Array(parseInt(reply[1])).keys()])
      })
      .catch((e) => {
        // config command may be renamed
        setdbs([...Array(16).keys()])
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
            setdbs([...Array(lastDB + 1).keys()])
          }
        } catch (e) {}
      })
      .catch(() => {})
  })
  const resetStatus = usePersistFn(() => {
    setdbs([0])
    setselectedDbIndex(0)
    setsearchMatch('')
    setsearchExact(false)
  })

  const changeDb = usePersistFn((dbIndex) => {
    let index = 0
    if (dbIndex !== false) {
      index = parseInt(dbIndex)
      setselectedDbIndex(index)
    }

    client
      .select(index)
      .then(() => {
        $bus.emit(EventTypes.RefreshKeyList, { client })
      })
      // select is not allowed in cluster mode
      .catch((e) => {
        message.error({
          content: e.message,
          duration: 3000,
        })

        // reset to db0
        setselectedDbIndex(() => 0)
      })
  })

  const addNewKey = usePersistFn(() => {
    if (!newKeyName) {
      return
    }

    // key to buffer
    const key = Buffer.from(newKeyName)

    const promise = setDefaultValue(key, selectedNewKeyType) as Promise<any>

    promise.then(() => {
      $bus.emit(EventTypes.RefreshKeyList, { client, key, type: 'add' })
      $bus.emit(EventTypes.ClickedKey, { client, key, newTab: true })
    })

    setnewKeyDialog(false)
  })

  const setDefaultValue = usePersistFn((key, type) => {
    switch (type) {
      case 'string': {
        return client.set(key, '')
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

  useImperativeHandle(ref, () => ({
    initShow,
  }))

  useMount(() => {
    $bus.on(EventTypes.ChangeDb, ({ c, dbIndex }) => {
      if (c !== client) {
        return 0
      }
      changeDb(dbIndex)
    })
  })

  return <div>OperateItem</div>
}

export const OperateItem = forwardRef(OperateItemInner)
