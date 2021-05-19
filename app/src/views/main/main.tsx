import * as React from 'react'
import { useEffect } from 'react'
import { Badge, Button, Card, Modal } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { decrement, increment } from '@/core/redux/actions/counter'

export default (): JSX.Element => {
  const dispatch = useDispatch()
  const addCount = (step: number) => dispatch(increment(step))
  const minusCount = () => dispatch(decrement())

  const count = useSelector((state: RootStore) => state.counter.count)

  const numbers = [1, 2, 3, 4, 5, 6]

  useEffect(() => {
    $tools.$bus.on($tools.EventTypes.EasterEgg, () => {
      Modal.success({
        title: '感谢访问，喜欢就给个star吧！',
      })
    })
  }, [])

  return (
    <Card>
      <Badge count={count} />
      {numbers.map((number) => (
        <Button
          key={number}
          onClick={() => {
            addCount(number)
          }}
        >
          增加{number}
        </Button>
      ))}
      <Button onClick={minusCount} type="primary">
        减少
      </Button>
    </Card>
  )
}
