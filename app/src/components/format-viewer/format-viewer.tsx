import React, { Dispatch, forwardRef, Ref, SetStateAction, useImperativeHandle, useMemo, useState } from 'react'
import { Radio } from 'antd'
import { usePersistFn } from 'ahooks'
import utils from '@/src/common/utils'
import { ViewerBinary, ViewerHex, ViewerJson, ViewerMsgpack, ViewerText, ViewerUnserialize } from './'

type ViewTypeComponent =
  | typeof ViewerBinary
  | typeof ViewerHex
  | typeof ViewerJson
  | typeof ViewerMsgpack
  | typeof ViewerText
  | typeof ViewerUnserialize

interface FormatViewerProps {
  content: Buffer
  setContent: Dispatch<SetStateAction<Buffer>>
  disabled: boolean
}

function FormatViewerInner(
  { content, setContent, disabled }: FormatViewerProps,
  ref: Ref<ForwardRefProps>
): JSX.Element {
  const viewerTypeMap = {
    Text: ViewerText,
    Hex: ViewerHex,
    Json: ViewerJson,
    Binary: ViewerBinary,
    Msgpack: ViewerMsgpack,
    Unserialize: ViewerUnserialize,
  }
  const viewers = Object.keys(viewerTypeMap)
  const contentVisible = utils.bufVisible(content)
  const [selectedView, select] = useState('')

  const getViewerTypeBySelect = usePersistFn(
    (select: typeof selectedView): ViewTypeComponent => {
      return viewerTypeMap[select]
    }
  )

  const initShow = usePersistFn(() => {
    // reload each viewer
    if (!content) {
      select('Text')
    }

    // json
    if (utils.isJson(utils.bufToString(content))) {
      select('Json')
    }
    // php unserialize
    else if (utils.isPHPSerialize(content)) {
      select('Unserialize')
    }
    // hex
    else if (!contentVisible) {
      select('Hex')
    } else {
      select('Text')
    }
  })

  useImperativeHandle(ref, () => ({
    initShow,
  }))

  const ViewerType = useMemo(() => getViewerTypeBySelect(selectedView), [selectedView])
  console.log('%c ViewerType', 'background: pink; color: #000', ViewerType)
  return (
    <div>
      <div className="flex center-v">
        <Radio.Group value={selectedView} size="small" onChange={(e) => select(e.target.value)}>
          {viewers.map((view) => (
            <Radio.Button key={view} value={view}>
              {view}
            </Radio.Button>
          ))}
        </Radio.Group>
        <span className="ml-8 text-info">size: {Buffer.byteLength(content)}</span>
      </div>
      {ViewerType && (
        <ViewerType
          disabled={disabled}
          contentVisible={contentVisible}
          content={content}
          setContent={setContent}
        />
      )}
    </div>
  )
}

export const FormatViewer = forwardRef(FormatViewerInner)
