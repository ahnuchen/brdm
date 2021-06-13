import React, { Dispatch, Ref, SetStateAction } from 'react'
import utils from '@/src/common/utils'
import { Input } from 'antd'

interface ViewerTextProps {
  content: Buffer
  setContent: Dispatch<SetStateAction<Buffer>>
  contentVisible: boolean
  disabled: boolean
}

export function ViewerText({ content, setContent }: ViewerTextProps, ref: Ref<ForwardRefProps>): JSX.Element {
  return (
    <div>
      <Input.TextArea
        onChange={(event) => {
          setContent(Buffer.from(event.target.value))
        }}
        value={utils.bufToString(content)}
      />
    </div>
  )
}
