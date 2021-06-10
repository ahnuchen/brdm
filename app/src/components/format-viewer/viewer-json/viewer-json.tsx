import React, { Dispatch, Ref, SetStateAction } from 'react'

interface ViewerJsonProps {
  content: Buffer
  setContent: Dispatch<SetStateAction<Buffer>>
  contentVisible: boolean
  disabled: boolean
}

export function ViewerJson({ content }: ViewerJsonProps, ref: Ref<ForwardRefProps>): JSX.Element {
  return <div>ViewerJson</div>
}
