import React, { forwardRef, Ref, useImperativeHandle } from 'react'
import { usePersistFn } from 'ahooks'
interface KeyContentSetProps {
  client: IORedisClient
  redisKey: string
}
export function KeyContentSetInner({ client, redisKey }: KeyContentSetProps, ref: Ref<any>): JSX.Element {
  const initShow = usePersistFn(() => {})

  useImperativeHandle(ref, () => ({
    initShow,
  }))

  return <div>KeyContentSet</div>
}

export const KeyContentSet = forwardRef(KeyContentSetInner)
