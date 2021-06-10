import React, { Dispatch, Ref, SetStateAction } from 'react'

interface ViewerBinaryProps {
  content: Buffer
  setContent: Dispatch<SetStateAction<Buffer>>
  contentVisible: boolean
  disabled: boolean
}

export function ViewerBinary({ content }: ViewerBinaryProps, ref: Ref<ForwardRefProps>): JSX.Element {
  return <div>ViewerBinary</div>
}
