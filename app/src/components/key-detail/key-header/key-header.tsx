import React, { useState } from 'react'
import { usePersistFn } from 'ahooks'
import { Button, Col, Form, Input, message, Modal, Row, Tag } from 'antd'
import { CheckOutlined, CopyFilled, DeleteFilled, SyncOutlined } from '@ant-design/icons'
import { i18n } from '@/src/i18n/i18n'
import utils from '@/src/common/utils'
import { $bus, EventTypes } from '@/src/common/emitter'
import { Buffer } from 'buffer'

interface KeyHeaderProps {
  client: IORedisClient
  redisKey: string
  keyType: RedisKeyType
  refreshContent(): void
}

export function KeyHeader({ client, redisKey, keyType, refreshContent }: KeyHeaderProps): JSX.Element {
  const [keyName, setKeyName] = useState<Buffer>(Buffer.from(redisKey))
  const [keyTTL, setKeyTTL] = useState(-1)
  const [binary, setBinary] = useState(false)

  const initShow = usePersistFn(() => {
    const isBinary = !utils.bufVisible(keyName)
    setBinary(isBinary)
    client.ttl(keyName).then((reply) => {
      setKeyTTL(reply)
    })
  })

  const onKeyNameChange = usePersistFn((input) => {
    const key = binary ? utils.xToBuffer(input) : Buffer.from(input)
    setKeyName(key)
  })

  const refreshKey = usePersistFn(() => {
    initShow()
    refreshContent()
  })

  const refreshKeyList = usePersistFn((key: any, type = 'del') => {
    $bus.emit(EventTypes.RefreshKeyList, client, key, type)
  })

  const deleteKey = usePersistFn(() => {
    const deleteConfirm = Modal.confirm({
      type: 'warning',
      content: i18n.$f('confirm_to_delete_key', { key: utils.bufToString(redisKey) }),
      onOk() {
        const redisKeyBuffer = Buffer.from(redisKey)
        client.del(redisKeyBuffer).then((reply) => {
          if (reply === 1) {
            message.success(i18n.$t('delete_success'), 1)

            $bus.emit(EventTypes.RemovePreTab)
            refreshKeyList(redisKeyBuffer)
          } else {
            message.error(`${redisKey} ${i18n.$t('delete_failed')}`, 1)
          }
        })
      },
      onCancel() {
        deleteConfirm.destroy()
      },
    })
  })

  const renameKey = usePersistFn((e) => {
    if (keyName.equals(Buffer.from(redisKey))) {
      return
    }
    const renameConfrim = Modal.confirm({
      content: i18n.$f('confirm_to_rename_key', {
        old: utils.bufToString(redisKey),
        new: utils.bufToString(keyName),
      }),
      type: 'warning',
      onOk() {
        const redisKeyBuffer = Buffer.from(redisKey)
        client
          .rename(redisKeyBuffer, keyName)
          .then((reply) => {
            message.success({
              content: i18n.$t('modify_success'),
              duration: 1,
            })
            refreshKeyList(redisKeyBuffer)
            refreshKeyList(keyName, 'add')
            $bus.emit(EventTypes.ClickedKey, client, keyName)
          })
          .catch((e) => {
            message.error({
              content: e.message,
              duration: 3,
            })
          })
      },
      onCancel() {
        renameConfrim.destroy()
      },
    })
  })

  const ttlKey = usePersistFn(() => {
    if (keyTTL <= 0) {
      const ttlConfirm = Modal.confirm({
        content: i18n.$t('ttl_delete'),
        type: 'warning',
        onOk() {
          setTTL(true)
        },
        onCancel() {
          ttlConfirm.destroy()
        },
      })
    } else {
      setTTL()
    }
  })

  const setTTL = usePersistFn((keyDeleted = false) => {
    client.expire(redisKey, keyTTL).then((reply) => {
      if (reply) {
        message.success({
          content: i18n.$t('modify_success'),
          duration: 1,
        })
        if (keyDeleted) {
          refreshKeyList(Buffer.from(redisKey))
          $bus.emit(EventTypes.RemovePreTab)
        }
      }
    })
  })

  const copyKey = usePersistFn(() => {
    require('electron').clipboard.writeText(redisKey)
    message.success({
      content: (
        <div>
          <Tag>{redisKey}</Tag> copied to clipboard`
        </div>
      ),
      duration: 1,
    })
  })

  return (
    <div>
      <Form>
        <Row>
          <Col className="ml-8">
            <Form.Item>
              <Input
                onInput={(e) => {
                  onKeyNameChange(e.currentTarget.value)
                }}
                onPressEnter={renameKey}
                value={utils.bufToString(keyName)}
                title={i18n.$t('click_enter_to_rename')}
                placeholder="keyName"
                addonBefore={<span className="text-orange">{keyType}</span>}
                suffix={
                  <CheckOutlined
                    onClick={renameKey}
                    title={i18n.$t('click_enter_to_rename')}
                    className="cursor-pointer"
                  />
                }
              />
            </Form.Item>
          </Col>
          <Col className="ml-8">
            <Input
              type="number"
              onInput={(e) => {
                const ttl = e.currentTarget.value
                if (ttl) {
                  setKeyTTL(parseFloat(ttl))
                }
              }}
              value={keyTTL}
              onPressEnter={ttlKey}
              addonBefore="TTL"
              title={i18n.$t('click_enter_to_ttl')}
              suffix={
                <CheckOutlined
                  onClick={ttlKey}
                  title={i18n.$t('click_enter_to_ttl')}
                  className="cursor-pointer"
                />
              }
            />
          </Col>
          <Col offset={1}>
            <Button title="copy key" onClick={copyKey}>
              <CopyFilled />
            </Button>
            <Button onClick={deleteKey} className="ml-8" title="delete">
              <DeleteFilled className="text-error" />
            </Button>
            <Button onClick={refreshKey} className="ml-8" title={i18n.$t('refresh_connection')}>
              <SyncOutlined className="text-success" />
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  )
}
