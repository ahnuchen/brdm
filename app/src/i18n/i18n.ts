import intl from 'react-intl-universal'

import enLocale from 'antd/es/locale/en_US'
import zhLocale from 'antd/es/locale/zh_CN'
import zhTwLocale from 'antd/es/locale/zh_TW'
import trTrLocale from 'antd/es/locale/tr_TR'
import ruLocale from 'antd/es/locale/ru_RU'
import ptBrLocale from 'antd/es/locale/pt_BR'
import deLocale from 'antd/es/locale/de_DE'
import frLocale from 'antd/es/locale/fr_FR'
import uaLocale from 'antd/es/locale/uk_UA'
import itLocale from 'antd/es/locale/it_IT'

import en from './langs/en'
import cn from './langs/cn'
import tw from './langs/tw'
import tr from './langs/tr'
import ru from './langs/ru'
import pt from './langs/pt'
import de from './langs/de'
import fr from './langs/fr'
import ua from './langs/ua'
import it from './langs/it'

const messages = {
  en: {
    message: en.message,
    antdLocale: enLocale,
  },
  cn: {
    message: cn.message,
    antdLocale: zhLocale,
  },
  tw: {
    message: tw.message,
    antdLocale: zhTwLocale,
  },
  tr: {
    message: tr.message,
    antdLocale: trTrLocale,
  },
  ru: {
    message: ru.message,
    antdLocale: ruLocale,
  },
  pt: {
    message: pt.message,
    antdLocale: ptBrLocale,
  },
  de: {
    message: de.message,
    antdLocale: deLocale,
  },
  fr: {
    message: fr.message,
    antdLocale: frLocale,
  },
  ua: {
    message: ua.message,
    antdLocale: uaLocale,
  },
  it: {
    message: it.message,
    antdLocale: itLocale,
  },
}

const locales = {}

type IAntdLocaleKey =
  | 'locale'
  | 'Pagination.items_per_page'
  | 'Pagination.jump_to'
  | 'Pagination.jump_to_confirm'
  | 'Pagination.page'
  | 'Pagination.prev_page'
  | 'Pagination.next_page'
  | 'Pagination.prev_5'
  | 'Pagination.next_5'
  | 'Pagination.prev_3'
  | 'Pagination.next_3'
  | 'DatePicker.lang.placeholder'
  | 'DatePicker.lang.yearPlaceholder'
  | 'DatePicker.lang.quarterPlaceholder'
  | 'DatePicker.lang.monthPlaceholder'
  | 'DatePicker.lang.weekPlaceholder'
  | 'DatePicker.lang.rangePlaceholder.0'
  | 'DatePicker.lang.rangePlaceholder.1'
  | 'DatePicker.lang.rangeYearPlaceholder.0'
  | 'DatePicker.lang.rangeYearPlaceholder.1'
  | 'DatePicker.lang.rangeMonthPlaceholder.0'
  | 'DatePicker.lang.rangeMonthPlaceholder.1'
  | 'DatePicker.lang.rangeWeekPlaceholder.0'
  | 'DatePicker.lang.rangeWeekPlaceholder.1'
  | 'DatePicker.lang.locale'
  | 'DatePicker.lang.today'
  | 'DatePicker.lang.now'
  | 'DatePicker.lang.backToToday'
  | 'DatePicker.lang.ok'
  | 'DatePicker.lang.clear'
  | 'DatePicker.lang.month'
  | 'DatePicker.lang.year'
  | 'DatePicker.lang.timeSelect'
  | 'DatePicker.lang.dateSelect'
  | 'DatePicker.lang.weekSelect'
  | 'DatePicker.lang.monthSelect'
  | 'DatePicker.lang.yearSelect'
  | 'DatePicker.lang.decadeSelect'
  | 'DatePicker.lang.yearFormat'
  | 'DatePicker.lang.dateFormat'
  | 'DatePicker.lang.dayFormat'
  | 'DatePicker.lang.dateTimeFormat'
  | 'DatePicker.lang.monthBeforeYear'
  | 'DatePicker.lang.previousMonth'
  | 'DatePicker.lang.nextMonth'
  | 'DatePicker.lang.previousYear'
  | 'DatePicker.lang.nextYear'
  | 'DatePicker.lang.previousDecade'
  | 'DatePicker.lang.nextDecade'
  | 'DatePicker.lang.previousCentury'
  | 'DatePicker.lang.nextCentury'
  | 'DatePicker.timePickerLocale.placeholder'
  | 'DatePicker.timePickerLocale.rangePlaceholder.0'
  | 'DatePicker.timePickerLocale.rangePlaceholder.1'
  | 'TimePicker.placeholder'
  | 'TimePicker.rangePlaceholder.0'
  | 'TimePicker.rangePlaceholder.1'
  | 'Calendar.lang.placeholder'
  | 'Calendar.lang.yearPlaceholder'
  | 'Calendar.lang.quarterPlaceholder'
  | 'Calendar.lang.monthPlaceholder'
  | 'Calendar.lang.weekPlaceholder'
  | 'Calendar.lang.rangePlaceholder.0'
  | 'Calendar.lang.rangePlaceholder.1'
  | 'Calendar.lang.rangeYearPlaceholder.0'
  | 'Calendar.lang.rangeYearPlaceholder.1'
  | 'Calendar.lang.rangeMonthPlaceholder.0'
  | 'Calendar.lang.rangeMonthPlaceholder.1'
  | 'Calendar.lang.rangeWeekPlaceholder.0'
  | 'Calendar.lang.rangeWeekPlaceholder.1'
  | 'Calendar.lang.locale'
  | 'Calendar.lang.today'
  | 'Calendar.lang.now'
  | 'Calendar.lang.backToToday'
  | 'Calendar.lang.ok'
  | 'Calendar.lang.clear'
  | 'Calendar.lang.month'
  | 'Calendar.lang.year'
  | 'Calendar.lang.timeSelect'
  | 'Calendar.lang.dateSelect'
  | 'Calendar.lang.weekSelect'
  | 'Calendar.lang.monthSelect'
  | 'Calendar.lang.yearSelect'
  | 'Calendar.lang.decadeSelect'
  | 'Calendar.lang.yearFormat'
  | 'Calendar.lang.dateFormat'
  | 'Calendar.lang.dayFormat'
  | 'Calendar.lang.dateTimeFormat'
  | 'Calendar.lang.monthBeforeYear'
  | 'Calendar.lang.previousMonth'
  | 'Calendar.lang.nextMonth'
  | 'Calendar.lang.previousYear'
  | 'Calendar.lang.nextYear'
  | 'Calendar.lang.previousDecade'
  | 'Calendar.lang.nextDecade'
  | 'Calendar.lang.previousCentury'
  | 'Calendar.lang.nextCentury'
  | 'Calendar.timePickerLocale.placeholder'
  | 'Calendar.timePickerLocale.rangePlaceholder.0'
  | 'Calendar.timePickerLocale.rangePlaceholder.1'
  | 'global.placeholder'
  | 'Table.filterTitle'
  | 'Table.filterConfirm'
  | 'Table.filterReset'
  | 'Table.filterEmptyText'
  | 'Table.emptyText'
  | 'Table.selectAll'
  | 'Table.selectInvert'
  | 'Table.selectNone'
  | 'Table.selectionAll'
  | 'Table.sortTitle'
  | 'Table.expand'
  | 'Table.collapse'
  | 'Table.triggerDesc'
  | 'Table.triggerAsc'
  | 'Table.cancelSort'
  | 'Modal.okText'
  | 'Modal.cancelText'
  | 'Modal.justOkText'
  | 'Popconfirm.okText'
  | 'Popconfirm.cancelText'
  | 'Transfer.titles.0'
  | 'Transfer.titles.1'
  | 'Transfer.searchPlaceholder'
  | 'Transfer.itemUnit'
  | 'Transfer.itemsUnit'
  | 'Transfer.remove'
  | 'Transfer.selectCurrent'
  | 'Transfer.removeCurrent'
  | 'Transfer.selectAll'
  | 'Transfer.removeAll'
  | 'Transfer.selectInvert'
  | 'Upload.uploading'
  | 'Upload.removeFile'
  | 'Upload.uploadError'
  | 'Upload.previewFile'
  | 'Upload.downloadFile'
  | 'Empty.description'
  | 'Icon.icon'
  | 'Text.edit'
  | 'Text.copy'
  | 'Text.copied'
  | 'Text.expand'
  | 'PageHeader.back'
  | 'Form.optional'
  | 'Form.defaultValidateMessages.default'
  | 'Form.defaultValidateMessages.required'
  | 'Form.defaultValidateMessages.enum'
  | 'Form.defaultValidateMessages.whitespace'
  | 'Form.defaultValidateMessages.date.format'
  | 'Form.defaultValidateMessages.date.parse'
  | 'Form.defaultValidateMessages.date.invalid'
  | 'Form.defaultValidateMessages.types.string'
  | 'Form.defaultValidateMessages.types.method'
  | 'Form.defaultValidateMessages.types.array'
  | 'Form.defaultValidateMessages.types.object'
  | 'Form.defaultValidateMessages.types.number'
  | 'Form.defaultValidateMessages.types.date'
  | 'Form.defaultValidateMessages.types.boolean'
  | 'Form.defaultValidateMessages.types.integer'
  | 'Form.defaultValidateMessages.types.float'
  | 'Form.defaultValidateMessages.types.regexp'
  | 'Form.defaultValidateMessages.types.email'
  | 'Form.defaultValidateMessages.types.url'
  | 'Form.defaultValidateMessages.types.hex'
  | 'Form.defaultValidateMessages.string.len'
  | 'Form.defaultValidateMessages.string.min'
  | 'Form.defaultValidateMessages.string.max'
  | 'Form.defaultValidateMessages.string.range'
  | 'Form.defaultValidateMessages.number.len'
  | 'Form.defaultValidateMessages.number.min'
  | 'Form.defaultValidateMessages.number.max'
  | 'Form.defaultValidateMessages.number.range'
  | 'Form.defaultValidateMessages.array.len'
  | 'Form.defaultValidateMessages.array.min'
  | 'Form.defaultValidateMessages.array.max'
  | 'Form.defaultValidateMessages.array.range'
  | 'Form.defaultValidateMessages.pattern.mismatch'
  | 'Image.preview'

type LangKey = keyof typeof en.message | IAntdLocaleKey

type LocalKey = keyof typeof messages

Object.keys(messages).map((lang) => {
  locales[lang] = { ...messages[lang].message, ...messages[lang].antdLocale }
})

const currentLocale = ($tools.settings.appSettings.get('lang') || 'cn') as LocalKey
intl.init({
  locales,
  currentLocale,
  localStorageLocaleKey: 'lang',
})

const i18n = {
  ...intl,
  $t: function (key: LangKey): string {
    return intl.get(key)
  },
  //format message
  $f: function (key: LangKey, variables: any): string {
    return intl.get(key, variables)
  },
}
const { antdLocale } = messages[currentLocale]

export { i18n, antdLocale }
