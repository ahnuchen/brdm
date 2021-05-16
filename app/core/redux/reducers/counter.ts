import { counterActionsTypes } from '@/core/redux/actions/counter'

export interface CounterState {
  count: number
}

const initialState = {
  count: 1,
}

export default (state: CounterState = initialState, action: CounterAction): CounterState => {
  switch (action.type) {
    case counterActionsTypes.INCREMENT:
      return {
        ...state,
        count: state.count + action.data,
      }
    case counterActionsTypes.DECREMENT:
      return {
        ...state,
        count: state.count - action.data,
      }
    default:
      return state
  }
}
