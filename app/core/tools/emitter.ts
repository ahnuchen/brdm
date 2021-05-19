import mitt from 'mitt'

export enum EventTypes {
  Connected = 'Connected',
  Disconnected = 'Disconnected',
  RefreshConnection = 'RefreshConnection',
  CloseConnection = 'CloseConnection',
  UpdateContent = 'UpdateContent',
  ReloadSettings = 'ReloadSettings',
  EditConnectionFinished = 'EditConnectionFinished',
  OpenDelBatch = 'OpenDelBatch',
  ClickedKey = 'ClickedKey',
  RefreshKeyList = 'RefreshKeyList',
  RemoveAllTab = 'RemoveAllTab',
  ChangeDb = 'ChangeDb',
  EasterEgg = 'EasterEgg',
  RemovePreTab = 'RemovePreTab',
  OpenCli = 'OpenCli',
}
export const $bus = mitt()
