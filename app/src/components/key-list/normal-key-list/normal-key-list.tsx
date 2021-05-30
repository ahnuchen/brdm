import React from 'react'
import { List } from 'antd'
import utils from '@/src/common/utils'

interface NormalKeyListProps {
  keyList: any[]
}

export function NormalKeyList({ keyList }: NormalKeyListProps): JSX.Element {
  return (
    <List>
      {keyList.map((k, i) => (
        <List.Item key={i}>{utils.bufToString(k)}</List.Item>
      ))}
    </List>
  )
}
