import * as React from 'react'
import { Badge, Button, Card, Modal, message } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { i18n } from '@/src/i18n/i18n'
import { useMount } from 'ahooks'

export default (): JSX.Element => {
  const count = useSelector((state: RootStore) => state.counter.count)

  useMount(() => {
    $tools.$bus.on($tools.EventTypes.EasterEgg, () => {
      Modal.success({
        title: 'Thank you for star！',
      })
    })
  })

  return (
    <Card>
      <Badge count={count} />
      <Button
        onClick={() => {
          message.success(i18n.$t('add_failed'))
        }}
      >
        测试多语言
      </Button>
      <Button
        onClick={() => {
          $tools.settings.appSettings.set('lang', 'en')
        }}
      >
        设置英文
      </Button>
    </Card>
  )
}
