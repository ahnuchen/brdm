import * as tools from './tools'
import { store } from '@/core/redux'

export async function initMain(): Promise<void> {
  return new Promise(async (resolve) => {
    global.__$tools = tools
    global.__$store = store
    resolve()
  })
}
