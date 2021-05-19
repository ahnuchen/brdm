import { ConnectionSettings } from '@/core/tools/settings/connection-settings'
import { connSettings } from '@/core/tools/settings/connection-settings'

const conn = connSettings

class Storage {
  addConnection(connection: ConnectionConfig): void {
    this.editConnectionByKey(connection, '')
  }
  getConnections(returnList?: false | undefined): ConnectionSettings
  getConnections(returnList: true): ConnectionConfig[]
  getConnections(returnList = false) {
    const connections = conn.get() || {}

    if (returnList) {
      const conns: ConnectionConfig[] = Object.keys(connections).map((key) => connections[key])
      this.sortConnections(conns)
      return conns
    }

    return connections
  }
  editConnectionByKey(connection: ConnectionConfig, oldKey = ''): void {
    const editedKey = connection.key || oldKey

    const connections = this.getConnections()
    delete connections[editedKey]

    this.updateConnectionName(connection, connections)
    const newKey = this.getConnectionKey(connection, true)
    connection.key = newKey

    connections[newKey] = connection
    this.setConnections(connections)
  }
  editConnectionItem(connection: ConnectionConfig, items: Partial<ConnectionConfig> = {}): void {
    const key = this.getConnectionKey(connection)
    const connections = this.getConnections()

    if (!connections[key]) {
      return
    }
    Object.assign(connection, items)
    Object.assign(connections[key], items)
    this.setConnections(connections)
  }
  updateConnectionName(connection: ConnectionConfig, connections: ConnectionSettings): void {
    let name = this.getConnectionName(connection)

    for (const key in connections) {
      if (connections.hasOwnProperty(key)) {
        // if 'name' same with others, add random suffix
        if (this.getConnectionName(connections[key]) == name) {
          name += ` (${Math.random().toString(36).substr(-3)})`
          break
        }
      }
    }

    connection.name = name
  }
  getConnectionName(connection: ConnectionConfig) {
    return connection.name || `${connection.host}@${connection.port}`
  }
  setConnections(connections: ConnectionSettings): void {
    conn.set(connections)
  }
  deleteConnection(connection: ConnectionConfig) {
    const connections = this.getConnections()
    const key = this.getConnectionKey(connection)

    delete connections[key]

    this.setConnections(connections)
  }
  getConnectionKey(connection: ConnectionConfig, forceUnique = false) {
    if (Object.keys(connection).length === 0) {
      return ''
    }

    if (connection.key) {
      return connection.key
    }

    if (forceUnique) {
      return new Date().getTime() + '_' + Math.random().toString(36).substr(-5)
    }

    return (connection.host || '') + (connection.port || '') + connection.name
  }
  sortConnections(connections: ConnectionConfig[]) {
    connections.sort(function (a, b) {
      if (a.key && b.key) {
        return a.key < b.key ? -1 : 1
      }

      return a.key ? 1 : b.key ? -1 : 0
    })
  }
}

export const storage = new Storage()
