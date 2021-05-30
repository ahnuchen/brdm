import React from 'react'
import './language-selector.less'
import { message, Modal, Select } from 'antd'
const { Option } = Select

const langs = [
  { value: 'en', label: 'English' },
  { value: 'cn', label: '简体中文' },
  { value: 'tw', label: '繁體中文' },
  { value: 'tr', label: 'Türkçe' },
  { value: 'ru', label: 'Русский' },
  { value: 'pt', label: 'Português' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'ua', label: 'Українською' },
]

export function LanguageSelector(): JSX.Element {
  return (
    <Select
      style={{ width: '30%' }}
      defaultValue={$tools.settings.appSettings.get('lang')}
      onChange={(opt) => {
        $tools.settings.appSettings.set('lang', opt)
        const confirmModal = Modal.confirm({
          title: 'success',
          content: 'restart to apply change in language, restart now?',
          onOk() {
            window.location.reload()
          },
          onCancel() {
            confirmModal.destroy()
          },
        })
        message.success('')
      }}
    >
      {langs.map((option) => (
        <Option key={option.value} value={option.value}>
          {option.label}
        </Option>
      ))}
    </Select>
  )
}
