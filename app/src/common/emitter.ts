/**
 * emitter on main thread will make redis client work unexpect
 * but on renderer thread will not associate in multi window
 */

import mitt from 'events'

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
export const $bus = new mitt.EventEmitter()
