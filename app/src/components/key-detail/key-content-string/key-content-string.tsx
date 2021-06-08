import React, { forwardRef, Ref, useImperativeHandle, useState } from 'react'
import { useMount, usePersistFn } from 'ahooks'
import utils from '@/src/common/utils'
import { Button, message } from 'antd'
import { i18n } from '@/src/i18n/i18n'
import { FormatViewer } from '@/src/components/format-viewer/format-viewer'
interface KeyContentStringProps {
  client: IORedisClient
  redisKey: string
}
export function KeyContentStringInner(
  { client, redisKey }: KeyContentStringProps,
  ref: Ref<ForwardRefProps>
): JSX.Element {
  const [content, setContent] = useState(Buffer.from(''))
  const [oldContent, setOldContent] = useState(Buffer.from(''))

  const initShow = usePersistFn(() => {
    client.getBuffer(redisKey).then((reply) => {
      setContent(reply)
    })
  })

  const save = usePersistFn(() => {
    client.set(redisKey, content).then((reply) => {
      if (reply === 'OK') {
        initShow()
        message.success(i18n.$t('modify_success'), 1)
      } else {
        message.error(i18n.$t('modify_failed'), 1)
      }
    })
  })

  useImperativeHandle(ref, () => ({
    initShow,
  }))

  useMount(() => {
    initShow()
  })

  return (
    <div>
      <FormatViewer setContent={setOldContent} content={content} />
      <Button type="primary" onClick={save}>
        {i18n.$t('save')}
      </Button>
    </div>
  )
}

export const KeyContentString = forwardRef(KeyContentStringInner)
