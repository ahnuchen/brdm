import React, { Dispatch, Ref, SetStateAction } from 'react'

interface ViewerUnserializeProps {
  content: Buffer
  setContent: Dispatch<SetStateAction<Buffer>>
  contentVisible: boolean
  disabled: boolean
}

export function ViewerUnserialize({ content }: ViewerUnserializeProps, ref: Ref<ForwardRefProps>): JSX.Element {
  return <div>ViewerUnserialize</div>
}
