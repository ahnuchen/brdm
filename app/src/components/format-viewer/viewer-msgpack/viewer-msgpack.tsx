import React, { Dispatch, Ref, SetStateAction } from 'react'

interface ViewerMsgpackProps {
  content: Buffer
  setContent: Dispatch<SetStateAction<Buffer>>
  contentVisible: boolean
  disabled: boolean
}

export function ViewerMsgpack({ content }: ViewerMsgpackProps, ref: Ref<ForwardRefProps>): JSX.Element {
  return <div>ViewerMsgpack</div>
}
