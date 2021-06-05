import React, { useImperativeHandle } from 'react'
import { usePersistFn } from 'ahooks'

interface KeyHeaderProps {
  client: IORedisClient
  redisKey: string
  keyType: RedisKeyType
  refreshContent(): void
}

export function KeyHeader({ client, redisKey, keyType, refreshContent }: KeyHeaderProps): JSX.Element {
  return <div>KeyHeader</div>
}
