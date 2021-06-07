import * as React from 'react'
import { Modal } from 'antd'
import { i18n } from '@/src/i18n/i18n'
import { useMount } from 'ahooks'
import { useState } from 'react'
import './main.less'
import { Aside } from '@/src/components/aside'
import { RightTabs } from '@/src/components/right-tabs'
import SplitPane from 'react-split-pane'
import { webFrame } from 'electron'

export default (): JSX.Element => {
  useMount(() => {
    //  init zoom factor setting
    webFrame.setZoomFactor($tools.settings.appSettings.get('zoomFactor') || 1)
  })

  return (
    <SplitPane
      onDragFinished={(size) => {
        $tools.settings.appSettings.set('sideWidth', size)
      }}
      split="vertical"
      minSize={200}
      maxSize={1000}
      defaultSize={$tools.settings.appSettings.get('sideWidth') || 200}
    >
      <Aside />
      <RightTabs />
    </SplitPane>
  )
}
