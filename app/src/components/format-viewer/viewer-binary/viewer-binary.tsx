import React, { Dispatch, Ref, SetStateAction, useEffect, useMemo, useRef } from 'react'
import { TextAreaRef } from 'antd/es/input/TextArea'
import { usePersistFn } from 'ahooks'
import { Input } from 'antd'
import utils from '@/src/common/utils'

interface ViewerBinaryProps {
  content: Buffer
  setContent: Dispatch<SetStateAction<Buffer>>
  contentVisible: boolean
  disabled: boolean
}

export function ViewerBinary(
  { content, setContent }: ViewerBinaryProps,
  ref: Ref<ForwardRefProps>
): JSX.Element {
  const inputRef = useRef<TextAreaRef | null>(null)

  const focusTextArea = usePersistFn(() => {
    inputRef.current && inputRef.current?.focus({ cursor: 'end' })
  })

  const binaryValue = useMemo(() => {
    let binary = ''

    for (const item of content) {
      binary += item.toString(2).padStart(8, '0')
    }

    return binary
  }, [content])

  useEffect(focusTextArea, [content])
  return (
    <div>
      <Input.TextArea
        ref={inputRef}
        rows={8}
        onChange={(event) => {
          setContent(utils.binaryStringToBuffer(event.target.value))
        }}
        value={binaryValue}
      />
    </div>
  )
}
