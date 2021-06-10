import React, { Dispatch, Ref, SetStateAction } from 'react'

interface ViewerTextProps {
  content: Buffer
  setContent: Dispatch<SetStateAction<Buffer>>
  contentVisible: boolean
  disabled: boolean
}

export function ViewerText({ content }: ViewerTextProps, ref: Ref<ForwardRefProps>): JSX.Element {
  return <div>ViewerText</div>
}
