type StringBuffer = string | Buffer

export default {
  data: {},
  get(name: string) {
    return this.data[name]
  },
  set(name: string, value: any) {
    this.data[name] = value
  },
  bufVisible(buf: StringBuffer): boolean {
    if (typeof buf == 'string') {
      return true
    }

    return buf.equals(Buffer.from(buf.toString()))
  },
  bufToString(buf: StringBuffer, forceHex = false) {
    // if (typeof buf == 'string') {
    //   return buf;
    // }

    if (!Buffer.isBuffer(buf)) {
      return buf
    }

    if (!forceHex && this.bufVisible(buf)) {
      return buf.toString()
    }

    return this.bufToHex(buf)
  },
  bufToHex(buf: Buffer) {
    const result = buf.toJSON().data.map((item) => {
      if (item >= 32 && item <= 126) {
        return String.fromCharCode(item)
      }
      return '\\x' + item.toString(16).padStart(2, '0')
    })

    return result.join('')
  },
  xToBuffer(str: string) {
    let result = ''

    for (let i = 0; i < str.length; ) {
      if (str.substr(i, 2) == '\\x') {
        result += str.substr(i + 2, 2)
        i += 4
      } else {
        result += Buffer.from(str[i++]).toString('hex')
      }
    }

    return Buffer.from(result, 'hex')
  },
  binaryStringToBuffer(str: string) {
    const groups = str.match(/[01]{8}/g)
    const numbers = groups?.map((binary) => parseInt(binary, 2)) || []

    return Buffer.from(new Uint8Array(numbers))
  },
  cutString(string: string, maxLength = 20) {
    if (string.length <= maxLength) {
      return string
    }

    return string.substr(0, maxLength) + '...'
  },
  isJson(string: string) {
    try {
      const obj = JSON.parse(string)
      return !!obj && typeof obj === 'object'
    } catch (e) {}

    return false
  },
  base64Encode(str: string) {
    return new Buffer(str, 'utf8').toString('base64')
  },
  base64Decode(str: string) {
    return new Buffer(str, 'base64').toString('utf8')
  },
  humanFileSize(size = 0): string {
    if (!size) {
      return '0'
    }
    const i = Math.floor(Math.log(size) / Math.log(1024))
    // @ts-ignore
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ['B', 'kB', 'MB', 'GB', 'TB'][i]
  },
  cloneObjWithBuff(object: AnyObj) {
    const clone = JSON.parse(JSON.stringify(object))

    for (const i in clone) {
      if (typeof clone[i] === 'object' && clone[i].type === 'Buffer') {
        clone[i] = Buffer.from(clone[i])
      }
    }

    return clone
  },
  keysToList(keys: Buffer[]) {
    return keys.map((key) => {
      return {
        name: this.bufToString(key),
        nameBuffer: key.toJSON(),
      }
    })
  },
  keysToTree(keys: Buffer[], separator = ':', openStatus = {}) {
    const tree = {}
    keys.forEach((key) => {
      let currentNode = tree
      const keyStr = this.bufToString(key)
      const keySplited = keyStr.split(separator)
      const lastIndex = keySplited.length - 1

      keySplited.forEach((value, index) => {
        // key node
        if (index === lastIndex) {
          currentNode[keyStr + '`k`'] = {
            keyNode: true,
            nameBuffer: key,
          }
        }
        // folder node
        else {
          currentNode[value] === undefined && (currentNode[value] = {})
        }

        currentNode = currentNode[value]
      })
    })

    return this.formatTreeData(tree, '', openStatus, separator)
  },
  formatTreeData(tree: AnyObj, previousKey = '', openStatus = {}, separator = ':') {
    return Object.keys(tree).map((key) => {
      const node: AnyObj = { name: key }

      if (!tree[key].keyNode && Object.keys(tree[key]).length > 0) {
        const tillNowKeyName = previousKey + key + separator
        node.open = !!openStatus[tillNowKeyName]
        node.children = this.formatTreeData(tree[key], tillNowKeyName, openStatus, separator)
        // keep folder node in top of the tree(not include the outest list)
        this.sortNodes(node.children)
        node.keyCount = node.children.reduce((a: AnyObj, b: AnyObj) => a + (b.keyCount || 0), 0)
        node.fullName = tillNowKeyName
      } else {
        node.keyCount = 1
        node.name = key.replace(/`k`$/, '')
        node.nameBuffer = tree[key].nameBuffer.toJSON()
      }

      return node
    })
  },
  // nodes is reference
  sortNodes(nodes: AnyObj[]) {
    nodes.sort(function (a, b) {
      if (a.children && b.children) {
        return 0
      }

      return a.children ? -1 : b.children ? 1 : 0
    })
  },
}
