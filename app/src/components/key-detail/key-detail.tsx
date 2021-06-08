import React, { ForwardedRef, useEffect, useRef, useState } from 'react'
import { KeyHeader } from './key-header'
import { KeyContentHash } from './key-content-hash'
import { KeyContentList } from './key-content-list'
import { KeyContentSet } from './key-content-set'
import { KeyContentStream } from './key-content-stream'
import { KeyContentString } from './key-content-string'
import { KeyContentZset } from './key-content-zset'
import { usePersistFn } from 'ahooks'
import { message } from 'antd'
import { i18n } from '@/src/i18n/i18n'
import { RedisKeyTypes } from '@/src/common/redisKeyTypes'

type KeyContentComponent =
  | typeof KeyContentString
  | typeof KeyContentHash
  | typeof KeyContentZset
  | typeof KeyContentSet
  | typeof KeyContentList
  | typeof KeyContentStream

interface KeyDetailProps {
  client: IORedisClient
  keyType: RedisKeyType
  redisKey: string
}

export function KeyDetail({ client, keyType, redisKey }: KeyDetailProps): JSX.Element {
  const [keyTypeSupport, setKeyTypeSupport] = useState(true)

  const keyContentRef = useRef<ForwardRefProps>(null)

  const getComponentNameByType = usePersistFn(
    (keyType): KeyContentComponent => {
      const map = {
        string: KeyContentString,
        hash: KeyContentHash,
        zset: KeyContentZset,
        set: KeyContentSet,
        list: KeyContentList,
        stream: KeyContentStream,
      }

      return map[keyType]
    }
  )

  const refreshContent = usePersistFn(() => {
    client.exists(redisKey).then((reply) => {
      if (!reply) {
        message.error(i18n.$t('key_not_exists'))
      }
      keyContentRef.current && keyContentRef.current.initShow()
    })
  })

  const KeyContent = getComponentNameByType(keyType) as KeyContentComponent

  useEffect(() => {
    if (RedisKeyTypes[keyType] !== keyType) {
      message.error(i18n.$t('key_type_not_support'))
      setKeyTypeSupport(false)
    }
  }, [keyType])

  return (
    <div>
      {keyTypeSupport && (
        <>
          <KeyHeader refreshContent={refreshContent} client={client} keyType={keyType} redisKey={redisKey} />
          <KeyContent ref={keyContentRef} redisKey={redisKey} client={client} />
        </>
      )}
    </div>
  )
}
