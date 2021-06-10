import React, { Dispatch, Ref, SetStateAction } from 'react'

interface ViewerHexProps {
  content: Buffer
  setContent: Dispatch<SetStateAction<Buffer>>
  contentVisible: boolean
  disabled: boolean
}

export function ViewerHex({ content }: ViewerHexProps, ref: Ref<ForwardRefProps>): JSX.Element {
  return <div>ViewerHex</div>
}
