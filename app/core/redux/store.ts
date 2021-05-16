import { createStore, applyMiddleware, Middleware } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './reducers'
import { createLogger } from 'redux-logger'
import { CounterState } from '@/core/redux/reducers/counter'

const initialState = {}
const logger = createLogger({
  level: 'info',
  collapsed: true,
})

const middlewares: Middleware[] = [thunk]

if (process.env.NODE_ENV !== 'production') {
  middlewares.push(logger)
}
export const store = createStore(rootReducer, initialState, applyMiddleware(...middlewares))

declare global {
  type AppStore = typeof store
  interface RootStore {
    counter: CounterState
  }
}
