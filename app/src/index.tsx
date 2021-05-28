import React, { Suspense } from 'react'
import reactDom from 'react-dom'
import { ipcRenderer } from 'electron'

import { initRenderer } from '@/core/renderer.init'
// import App from './app'
import '@/src/styles/index.less'

initRenderer()
ipcRenderer.on('dom-ready', (_, createConfig) => {
  const App = React.lazy(() => import('./app'))
  reactDom.render(
    <Suspense fallback={null}>
      <App createConfig={createConfig} />
    </Suspense>,
    document.getElementById('app')
  )
})
