import React, { forwardRef, Ref, useImperativeHandle } from 'react'
import { usePersistFn } from 'ahooks'

interface KeyContentListProps {
  client: IORedisClient
  redisKey: string
}

export function KeyContentListInner(
  { client, redisKey }: KeyContentListProps,
  ref: Ref<ForwardRefProps>
): JSX.Element {
  const initShow = usePersistFn(() => {})

  useImperativeHandle(ref, () => ({
    initShow,
  }))
  return <div>KeyContentListInner</div>
}

export const KeyContentList = forwardRef(KeyContentListInner)
