import React, { forwardRef, Ref, useImperativeHandle } from 'react'
import { usePersistFn } from 'ahooks'
interface KeyContentZsetProps {
  client: IORedisClient
  redisKey: string
}
export function KeyContentZsetInner({ client, redisKey }: KeyContentZsetProps, ref: Ref<any>): JSX.Element {
  const initShow = usePersistFn(() => {})

  useImperativeHandle(ref, () => ({
    initShow,
  }))

  return <div>KeyContentZset</div>
}

export const KeyContentZset = forwardRef(KeyContentZsetInner)
