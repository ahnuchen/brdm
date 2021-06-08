import React, { Dispatch, Ref, SetStateAction, useState } from 'react'
import { Radio } from 'antd'
import utils from '@/src/common/utils'

interface FormatViewerProps {
  content: Buffer
  setContent: Dispatch<SetStateAction<Buffer>>
}

export function FormatViewer(
  { content, setContent }: FormatViewerProps,
  ref: Ref<ForwardRefProps>
): JSX.Element {
  const viewers = ['Text', 'Hex', 'Json', 'Binary', 'Msgpack', 'Unserialize']
  const [selected, select] = useState(viewers[0])
  return (
    <div>
      <div className="flex center-v">
        <Radio.Group size="small" onChange={(e) => select(e.target.value)} defaultValue="Text">
          {viewers.map((view) => (
            <Radio.Button key={view} value={view}>
              {view}
            </Radio.Button>
          ))}
        </Radio.Group>
        <span className="ml-8 text-info">size: {Buffer.byteLength(content)}</span>
      </div>
      <div>{utils.bufToString(content)}</div>
    </div>
  )
}
