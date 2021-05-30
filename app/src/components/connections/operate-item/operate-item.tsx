import React, { forwardRef, Ref, useImperativeHandle } from 'react'
import { usePersistFn } from 'ahooks'

function OperateItemInner(props: any, ref: Ref<any>): JSX.Element {
  const initShow = usePersistFn(() => {
    console.log('%c init operateItemShow', 'background: pink; color: #000')
  })

  useImperativeHandle(ref, () => ({
    initShow,
  }))

  return <div>OperateItem</div>
}

export const OperateItem = forwardRef(OperateItemInner)
