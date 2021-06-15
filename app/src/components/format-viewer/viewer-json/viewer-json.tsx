import React, { Dispatch, Ref, SetStateAction, useMemo, useState } from 'react'
import ReactJson from 'react-json-view'
import JSONBigInt from 'json-bigint'
import { i18n } from '@/src/i18n/i18n'
import utils from '@/src/common/utils'
import { Alert } from 'antd'

const JSONBig = JSONBigInt({ storeAsString: true })

interface ViewerJsonProps {
  content: Buffer
  setContent: Dispatch<SetStateAction<Buffer>>
  contentVisible: boolean
  disabled: boolean
}

export function ViewerJson({ content }: ViewerJsonProps, ref: Ref<ForwardRefProps>): JSX.Element {
  const [parseFailed, setParseFailed] = useState(false)
  const newContent = useMemo(() => {
    try {
      const transedJson = JSONBig.stringify(JSONBig.parse(utils.bufToString(content)))
      return JSON.parse(transedJson)
    } catch (e) {
      setParseFailed(true)
      return false
    }
  }, [content])

  return (
    <div>
      {parseFailed ? (
        <Alert type="error" description="🤷‍♂️" message={i18n.$t('json_format_failed')} />
      ) : (
        <ReactJson displayDataTypes={false} theme="rjv-default" name={null} src={newContent} />
      )}
    </div>
  )
}
