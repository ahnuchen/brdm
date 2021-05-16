export enum counterActionsTypes {
  DECREMENT = 'DECREMENT',
  INCREMENT = 'INCREMENT',
}

export const increment = (step = 1): CounterAction => ({
  type: counterActionsTypes.INCREMENT,
  data: step,
})

export const decrement = (step = 1): CounterAction => ({
  type: counterActionsTypes.DECREMENT,
  data: step,
})
