import React, { Dispatch, Ref, SetStateAction, useRef } from 'react'
import { TextAreaRef } from 'antd/es/input/TextArea'
import { useMount, usePersistFn } from 'ahooks'
import { Input } from 'antd'
import utils from '@/src/common/utils'

interface ViewerHexProps {
  content: Buffer
  setContent: Dispatch<SetStateAction<Buffer>>
  contentVisible: boolean
  disabled: boolean
}

export function ViewerHex({ content, setContent }: ViewerHexProps, ref: Ref<ForwardRefProps>): JSX.Element {
  const inputRef = useRef<TextAreaRef | null>(null)

  const focusTextArea = usePersistFn(() => {
    inputRef.current && inputRef.current?.focus({ cursor: 'end' })
  })

  useMount(focusTextArea)
  return (
    <div>
      <Input.TextArea
        ref={inputRef}
        rows={8}
        onChange={(event) => {
          setContent(utils.xToBuffer(event.target.value))
        }}
        value={utils.bufToString(content)}
      />
    </div>
  )
}
