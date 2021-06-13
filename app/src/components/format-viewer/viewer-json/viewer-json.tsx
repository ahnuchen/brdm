import React, { Dispatch, Ref, SetStateAction, useMemo } from 'react'
import ReactJson, { ReactJsonViewProps } from 'react-json-view'
import JSONBigInt from 'json-bigint'
import { i18n } from '@/src/i18n/i18n'
import utils from '@/src/common/utils'

const JSONBig = JSONBigInt({ storeAsString: true })

interface ViewerJsonProps {
  content: Buffer
  setContent: Dispatch<SetStateAction<Buffer>>
  contentVisible: boolean
  disabled: boolean
}

export function ViewerJson({ content }: ViewerJsonProps, ref: Ref<ForwardRefProps>): JSX.Element {
  const newContent = useMemo(() => {
    try {
      const transedJson = JSONBig.stringify(JSONBig.parse(utils.bufToString(content)))
      return JSON.parse(transedJson)
    } catch (e) {
      return false
    }
  }, [content])

  return (
    <div>
      <ReactJson
        displayDataTypes={false}
        displayObjectSize={true}
        theme="rjv-default"
        name={null}
        src={newContent}
      />
    </div>
  )
}
