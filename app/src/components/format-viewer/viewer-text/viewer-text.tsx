import React, { Dispatch, Ref, SetStateAction, useEffect, useRef, useState } from 'react'
import utils from '@/src/common/utils'
import { Input } from 'antd'
import { useMount, usePersistFn, useUpdate } from 'ahooks'
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

  useEffect(focusTextArea, [content])

  return (
    <Input.TextArea
      ref={inputRef}
      rows={8}
      onChange={(event) => {
        setContent(Buffer.from(event.target.value))
      }}
      value={utils.bufToString(content)}
    />
  )
}
