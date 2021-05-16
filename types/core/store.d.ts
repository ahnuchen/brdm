import { counterActionsTypes } from '@/core/redux/actions/counter'
import { AnyAction } from 'redux'

declare global {
  /**
   * Redux Store
   *
   * @source app/core/store
   * @define build/webpack.config.base.ts#L39
   */

  interface CounterAction extends AnyAction {
    type: counterActionsTypes
    data: number
  }

  const $store: AppStore

  namespace NodeJS {
    interface Global {
      __$store: AppStore
    }
  }
}
