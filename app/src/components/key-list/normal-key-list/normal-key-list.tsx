import React from 'react'
import utils from '@/src/common/utils'

interface NormalKeyListProps {
  keyList: any[]
}

export function NormalKeyList({ keyList }: NormalKeyListProps): JSX.Element {
  return (
    <ul>
      {keyList.map((k, i) => (
        <li key={i}>{utils.bufToString(k)}</li>
      ))}
    </ul>
  )
}
