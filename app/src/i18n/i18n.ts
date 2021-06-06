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

import en from './langs/en'
import cn from './langs/cn'
import tw from './langs/tw'
import tr from './langs/tr'
import ru from './langs/ru'
import pt from './langs/pt'
import de from './langs/de'
import fr from './langs/fr'
import ua from './langs/ua'

const messages = {
  en: {
    message: en.message,
    antdLocal: enLocale,
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
}

const locales = {}

type LangKey = keyof typeof en.message

Object.keys(messages).map((lang) => {
  locales[lang] = messages[lang].message
})

const currentLocale = $tools.settings.appSettings.get('lang') || 'cn'
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
