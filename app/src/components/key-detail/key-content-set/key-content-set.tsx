import React, { forwardRef, Ref, useImperativeHandle } from 'react'
import { usePersistFn } from 'ahooks'
import { FormatViewer } from '@/src/components/format-viewer'
interface KeyContentSetProps {
  client: IORedisClient
  redisKey: string
}
export function KeyContentSetInner(
  { client, redisKey }: KeyContentSetProps,
  ref: Ref<ForwardRefProps>
): JSX.Element {
  const initShow = usePersistFn(() => {})

  useImperativeHandle(ref, () => ({
    initShow,
  }))

  return (
    <div>
      <div>{redisKey}</div>
    </div>
  )
}

export const KeyContentSet = forwardRef(KeyContentSetInner)
