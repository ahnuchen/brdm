import React, { forwardRef, Ref, useImperativeHandle } from 'react'
import { usePersistFn } from 'ahooks'
interface KeyContentHashProps {
  client: IORedisClient
  redisKey: string
}
function KeyContentHashInner(
  { client, redisKey }: KeyContentHashProps,
  ref: Ref<ForwardRefProps>
): JSX.Element {
  const initShow = usePersistFn(() => {})

  useImperativeHandle(ref, () => ({
    initShow,
  }))

  return <div>KeyContentHash</div>
}

export const KeyContentHash = forwardRef(KeyContentHashInner)
