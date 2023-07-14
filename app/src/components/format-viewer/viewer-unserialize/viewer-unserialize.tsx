import React, { Dispatch, Ref, SetStateAction, useMemo, useState } from 'react'
import ReactJson from 'react-json-view'
import utils from '@/src/common/utils'
import { unserialize } from 'php-serialize'
import { Alert } from 'antd'
import { i18n } from '@/src/i18n/i18n'

interface ViewerUnserializeProps {
  content: Buffer
  setContent: Dispatch<SetStateAction<Buffer>>
  contentVisible: boolean
  disabled: boolean
}

export function ViewerUnserialize({ content }: ViewerUnserializeProps, ref: Ref<ForwardRefProps>): JSX.Element {
  const [parseFailed, setParseFailed] = useState(false)

  const newContent = useMemo(() => {
    try {
      return unserialize(utils.bufToString(content))
    } catch (e) {
      setParseFailed(true)
      return false
    }
  }, [content])

  return (
    <div>
      {parseFailed ? (
        <Alert type="error" description="🤷‍♂️" message={i18n.$t('php_unserialize_format_failed')} />
      ) : (
        <ReactJson displayDataTypes={false} theme="rjv-default" name={null} src={newContent} />
      )}
    </div>
  )
}
