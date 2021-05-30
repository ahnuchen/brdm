import React, { forwardRef, Ref, useImperativeHandle } from 'react'
import { usePersistFn } from 'ahooks'

interface KeyListProps {}

function KeyListInner(props: KeyListProps, ref: Ref<any>): JSX.Element {
  const initShow = usePersistFn(() => {
    console.log('%c init keylist show', 'background: pink; color: #000')
  })

  useImperativeHandle(ref, () => ({
    initShow,
  }))

  return <div>keylist</div>
}

export const KeyList = forwardRef(KeyListInner)
