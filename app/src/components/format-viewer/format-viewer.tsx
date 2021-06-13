import React, { Dispatch, forwardRef, Ref, SetStateAction, useImperativeHandle, useMemo, useState } from 'react'
import { message, Radio } from 'antd'
import { usePersistFn } from 'ahooks'
import utils from '@/src/common/utils'
import { ViewerBinary, ViewerHex, ViewerJson, ViewerMsgpack, ViewerText, ViewerUnserialize } from './'
import { CopyTwoTone } from '@ant-design/icons'
import { i18n } from '@/src/i18n/i18n'

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

  const copyContent = usePersistFn(() => {
    require('electron').clipboard.writeText(utils.bufToString(content))
    message.success(i18n.$t('copy_success'), 1)
  })

  useImperativeHandle(ref, () => ({
    initShow,
  }))

  const ViewerType = useMemo(() => getViewerTypeBySelect(selectedView), [selectedView])
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
        <CopyTwoTone className="cursor-pointer ml-8" onClick={copyContent} />
        <span className="ml-2 text-info">size: {Buffer.byteLength(content)}</span>
      </div>
      {ViewerType && (
        <div className="mt-8">
          <ViewerType
            disabled={disabled}
            contentVisible={contentVisible}
            content={content}
            setContent={setContent}
          />
        </div>
      )}
    </div>
  )
}

export const FormatViewer = forwardRef(FormatViewerInner)
