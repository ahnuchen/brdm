import React, { useState } from 'react'
import './new-connection-modal.less'
import { Modal, Form, Input, Button, InputNumber, Checkbox, Divider } from 'antd'
import { i18n } from '@/src/i18n/i18n'
import { FileAddFilled } from '@ant-design/icons'
import { usePersistFn } from 'ahooks'
const FormItem = Form.Item

interface NewConnectionModalProps {
  visible: boolean
  setVisible(visible: boolean): void
  editMode: boolean
  connectionConfig?: ConnectionConfig
  onConfigFinished(config: ConnectionConfig): void
}

const redisConnectConfig = {
  host: '127.0.0.1',
  port: 6379,
  password: '',
  name: '',
  separator: ':',
  SSHTunnel: false,
  SSLTunnel: false,
  clusterMode: false,
}

export function NewConnectionModal({
  visible,
  setVisible,
  editMode = false,
  connectionConfig = redisConnectConfig,
  onConfigFinished,
}: NewConnectionModalProps): JSX.Element {
  const [redisConfigForm] = Form.useForm()
  const [SSHTunnel, setSSHTunnel] = useState(false)
  const [SSLTunnel, setSSLTunnel] = useState(false)
  const [clusterMode, setClusterMode] = useState(false)

  const onConfigSubmit = usePersistFn(() => {
    const config = redisConfigForm.getFieldsValue()
    !config.host && (config.host = redisConnectConfig.host)
    !config.port && (config.port = redisConnectConfig.port)
    const oldKey = $tools.storage.getConnectionKey(connectionConfig)
    $tools.storage.editConnectionByKey(config, oldKey)
    setVisible(false)
    onConfigFinished && onConfigFinished(config)
  })

  return (
    <Modal
      title={i18n.$t(editMode ? 'edit_connection' : 'new_connection')}
      visible={visible}
      onCancel={() => setVisible(false)}
      onOk={onConfigSubmit}
    >
      <Form.Provider>
        <Form
          onValuesChange={(v, all) => {
            if (SSHTunnel !== all.SSHTunnel) {
              setSSHTunnel(all.SSHTunnel)
            }
            if (SSLTunnel !== all.SSLTunnel) {
              setSSLTunnel(all.SSLTunnel)
            }
          }}
          labelCol={{ span: 4 }}
          form={redisConfigForm}
          initialValues={connectionConfig}
        >
          <FormItem label="Host" name="host">
            <Input placeholder="127.0.0.1" />
          </FormItem>

          <FormItem label="Port" name="port">
            <InputNumber step={1} placeholder="6379" />
          </FormItem>

          <FormItem label="Password" name="password">
            <Input.Password />
          </FormItem>
          <FormItem label="Name" name="name">
            <Input />
          </FormItem>
          <FormItem tooltip={i18n.$t('separator_tip')} label="Separator" name="separator">
            <Input />
          </FormItem>
          <div className="flex">
            <Form.Item
              wrapperCol={{
                offset: 4,
                span: 4,
              }}
              name="SSHTunnel"
              valuePropName="checked"
            >
              <Checkbox>SSH</Checkbox>
            </Form.Item>
            <Form.Item
              wrapperCol={{
                offset: 8,
                span: 4,
              }}
              name="SSLTunnel"
              valuePropName="checked"
            >
              <Checkbox>SSL</Checkbox>
            </Form.Item>
            <Form.Item
              tooltip={i18n.$t('cluster_faq')}
              wrapperCol={{
                offset: 16,
                span: 4,
              }}
              name="clusterMode"
              valuePropName="checked"
            >
              <Checkbox>cluster</Checkbox>
            </Form.Item>
          </div>
        </Form>
        {SSHTunnel && (
          <>
            <Divider type="horizontal">SSH Tunnel</Divider>

            <Form labelCol={{ span: 4 }}>
              <FormItem label="Host" name="host">
                <Input />
              </FormItem>
              <FormItem label="Port" name="port">
                <InputNumber />
              </FormItem>
              <FormItem label="Username" name="username">
                <Input />
              </FormItem>
              <FormItem label="Password" name="password">
                <Input.Password />
              </FormItem>
              <FormItem>
                <Input type="file" />
              </FormItem>
            </Form>
          </>
        )}
        {SSLTunnel && (
          <>
            <Divider type="horizontal">SSL</Divider>
            <Form labelCol={{ span: 4 }}>
              <FormItem label="PrivateKey">
                <Input
                  addonAfter={<FileAddFilled style={{ cursor: 'pointer' }} />}
                  placeholder="SSL Private Key Pem (key)"
                />
              </FormItem>
              <FormItem label="PublicKey">
                <Input placeholder="SSL Public Key Pem (cert)" />
              </FormItem>
              <FormItem label="Authority">
                <Input placeholder="SSL Certificate Authority (CA)" />
              </FormItem>
            </Form>
          </>
        )}
      </Form.Provider>
    </Modal>
  )
}
