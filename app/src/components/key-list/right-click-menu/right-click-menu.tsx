import React from 'react'
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'

interface RightClickMenuProps {
  children: React.ReactNode
  id: string
}

export function RightClickMenu({ children, id }: RightClickMenuProps): JSX.Element {
  return (
    <>
      <ContextMenuTrigger id={id}>{children}</ContextMenuTrigger>
      <ContextMenu id={id}>
        <MenuItem>多选</MenuItem>
        <MenuItem>删除</MenuItem>
        <MenuItem>打开</MenuItem>
      </ContextMenu>
    </>
  )
}
