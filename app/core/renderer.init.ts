import { remote } from 'electron'

export function initRenderer(): void {
  global.__$tools = remote.getGlobal('__$tools')
  global.__$store = remote.getGlobal('__$store')
}
