import React, { Dispatch, Ref, SetStateAction, useRef } from 'react'
import { Input } from 'antd'
import { useMount, usePersistFn } from 'ahooks'
import { TextAreaRef } from 'antd/es/input/TextArea'

interface ViewerTextProps {
  content: Buffer
  setContent: Dispatch<SetStateAction<Buffer>>
  contentVisible: boolean
  disabled: boolean
}

export function ViewerText({ content, setContent }: ViewerTextProps, ref: Ref<ForwardRefProps>): JSX.Element {
  const inputRef = useRef<TextAreaRef | null>(null)

  const focusTextArea = usePersistFn(() => {
    inputRef.current && inputRef.current?.focus({ cursor: 'end' })
  })

  useMount(focusTextArea)

  return (
    <Input.TextArea
      ref={inputRef}
      rows={8}
      onChange={(event) => {
        setContent(Buffer.from(event.target.value))
      }}
      value={content.toString()}
    />
  )
}
