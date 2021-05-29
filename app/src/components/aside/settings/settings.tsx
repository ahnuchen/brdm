import React, { useState } from 'react'
import { Form, Input, InputNumber, Modal } from 'antd'
import { i18n } from '@/src/i18n/i18n'
import { LanguageSelector } from '@/src/components/aside/settings/language-selector'
import { webFrame } from 'electron'

interface SettingProps {
  visible: boolean
  setVisible(v: boolean): void
}

export function Settings({ visible, setVisible }: SettingProps): JSX.Element {
  return (
    <Modal
      visible={visible}
      title={i18n.$t('settings')}
      onCancel={() => {
        setVisible(false)
      }}
    >
      <Form layout="vertical">
        <Form.Item label={i18n.$t('select_lang')} tooltip="effect after restart">
          <LanguageSelector />
        </Form.Item>
        <Form.Item label={i18n.$t('page_zoom')} tooltip="use keyboard arrow to adjust">
          <InputNumber
            keyboard={true}
            step={0.1}
            min={0.5}
            max={2.0}
            defaultValue={$tools.settings.appSettings.get('zoomFactor') || 1}
            onChange={(zoomFactor: number) => {
              webFrame.setZoomFactor(zoomFactor)
              $tools.settings.appSettings.set('zoomFactor', zoomFactor)
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
