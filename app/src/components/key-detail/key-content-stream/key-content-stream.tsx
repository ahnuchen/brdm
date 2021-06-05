import React, { forwardRef, Ref, useImperativeHandle } from 'react'
import { usePersistFn } from 'ahooks'
interface KeyContentStreamProps {
  client: IORedisClient
  redisKey: string
}
export function KeyContentStreamInner({ client, redisKey }: KeyContentStreamProps, ref: Ref<any>): JSX.Element {
  const initShow = usePersistFn(() => {})

  useImperativeHandle(ref, () => ({
    initShow,
  }))

  return <div>KeyContentStream</div>
}

export const KeyContentStream = forwardRef(KeyContentStreamInner)
