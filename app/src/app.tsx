import * as React from 'react'
import { ConfigProvider } from 'antd'
import { antdLocale } from './i18n/i18n'

import { AppRouter, AppLayout } from '@/src/components'

import routes from './auto-routes'

interface AppProps {
  createConfig: CreateConfig
}

export default class App extends React.Component<AppProps> {
  render(): JSX.Element {
    return (
      <ConfigProvider locale={antdLocale}>
        <AppLayout createConfig={this.props.createConfig}>
          <AppRouter routes={routes} store={$store} />
        </AppLayout>
      </ConfigProvider>
    )
  }
}
