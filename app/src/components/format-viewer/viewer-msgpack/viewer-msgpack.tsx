import React, { Dispatch, Ref, SetStateAction, useMemo, useState } from 'react'
import ReactJson from 'react-json-view'
import { decode } from '@msgpack/msgpack'
import { Alert } from 'antd'
import { i18n } from '@/src/i18n/i18n'

interface ViewerMsgpackProps {
  content: Buffer
  setContent: Dispatch<SetStateAction<Buffer>>
  contentVisible: boolean
  disabled: boolean
}

export function ViewerMsgpack({ content }: ViewerMsgpackProps, ref: Ref<ForwardRefProps>): JSX.Element {
  const [parseFailed, setParseFailed] = useState(false)
  const theme = 'rjv-default'
  // const theme = 'summerfruit'
  const newContent = useMemo(() => {
    try {
      return decode(content)
    } catch (e) {
      setParseFailed(true)
      return false
    }
  }, [content])

  return (
    <div>
      {parseFailed ? (
        <Alert type="error" description="🤷‍♂️" message={i18n.$t('msgpack_format_failed')} />
      ) : (
        <ReactJson theme={theme} src={newContent as AnyObj} displayDataTypes={false} name={null} />
      )}
    </div>
  )
}
