import React, { forwardRef, Ref, useImperativeHandle } from 'react'
import { usePersistFn } from 'ahooks'
interface KeyContentStringProps {
  client: IORedisClient
  redisKey: string
}
export function KeyContentStringInner({ client, redisKey }: KeyContentStringProps, ref: Ref<any>): JSX.Element {
  const initShow = usePersistFn(() => {})

  useImperativeHandle(ref, () => ({
    initShow,
  }))

  return <div>KeyContentString</div>
}

export const KeyContentString = forwardRef(KeyContentStringInner)
