import React, {
  Component,
  forwardRef,
  Ref,
  useEffect,
  useImperativeHandle,
  useReducer,
  useRef,
  useState,
} from 'react'
import { useMount, usePersistFn } from 'ahooks'
import { Readable } from 'stream'
import { i18n } from '@/src/i18n/i18n'
import { Button, message } from 'antd'
import { KeyListTree } from '@/src/components/key-list/key-list-tree'

interface KeyListProps {
  config: ConnectionConfig
  client: IORedisClient
  setOpening(opening: boolean): void
}

function KeyListInner({ config, client, setOpening }: KeyListProps, ref: Ref<any>): JSX.Element {
  const scanStreams = useRef<Readable[]>([])
  const [keyList, setKeyList] = useState<any[]>(() => [])
  const tempKeyList = useRef([])
  const onePageList = useRef([])
  const onePageFinishedCount = useRef(0)
  const keysPageSize = useRef(500)
  const searchPageSize = useRef(10000)
  const scanningCount = useRef(0)
  const [scanMoreDisabled, setScanMoreDisabled] = useState(false)
  const firstPageFinished = useRef(false)
  const initShow = usePersistFn(() => {
    setOpening(true)
    refreshKeyList()
  })
  const refreshKeyList = usePersistFn((resetKeyListPrevious = true) => {
    // reset previous list, not append mode
    resetKeyListPrevious && resetKeyList()

    // extract search

    // search loading

    // init scanStream
    setOpening(true)
    if (!scanStreams.current.length) {
      initScanStreamsAndScan()
    }

    // scan more, resume previous scanStream
    else {
      // reset one page scan param
      onePageList.current = []
      onePageFinishedCount.current = 0

      for (const stream of scanStreams.current) {
        stream.resume()
      }
    }
  })

  const initScanStreamsAndScan = usePersistFn(() => {
    // this.client.nodes: cluster
    let nodes
    if ('nodes' in client && client.nodes) {
      nodes = client.nodes('master')
    } else {
      nodes = [client]
    }
    scanningCount.current = nodes.length

    nodes.map((node) => {
      const scanOption = {
        match: getMatchMode(),
        count: keysPageSize.current,
      }

      // scan count is bigger when in search mode
      scanOption.match != '*' && (scanOption.count = searchPageSize.current)

      // @ts-ignore
      const stream = node.scanBufferStream(scanOption) as Readable
      scanStreams.current.push(stream)

      stream.on('data', (keys) => {
        console.log('%c scan data', 'background: pink; color: #000', keys)
        onePageList.current = onePageList.current.concat(keys)
        // scan once reaches page size
        if (onePageList.current.length >= keysPageSize.current) {
          // temp stop
          stream.pause()
          // search input icon recover

          // last node refresh keylist
          if (++onePageFinishedCount.current >= scanningCount.current) {
            // clear key list only after data scaned, to prevent list jitter
            if (!firstPageFinished.current) {
              firstPageFinished.current = true
              tempKeyList.current = []
              firstPageFinished.current = true
              setKeyList(() => [])
            }

            // this page key list append to raw key list
            tempKeyList.current = tempKeyList.current.concat(onePageList.current.sort())
            setKeyList(() => tempKeyList.current)
            setOpening(false)
          }
        }
      })
      stream.on('end', () => {
        // all nodes scan finished(cusor back to 0)
        if (--scanningCount.current <= 0) {
          // clear key list only after data scaned, to prevent list jitter
          if (!firstPageFinished.current) {
            firstPageFinished.current = true
            tempKeyList.current = []
            setKeyList(() => [])
          }

          // this page key list append to raw key list

          tempKeyList.current = tempKeyList.current.concat(onePageList.current.sort())
          setKeyList(() => tempKeyList.current)
          setScanMoreDisabled(() => true)
          // search input icon recover
          setOpening(false)
        }
      })
      stream.on('error', (e) => {
        // scan command disabled, other functions may be used normally
        if (
          (e.message.includes('unknown command') && e.message.includes('scan')) ||
          // eslint-disable-next-line
          e.message.includes("command 'SCAN' is not allowed")
        ) {
          message.error({
            message: i18n.$t('scan_disabled'),
            duration: 1500,
          })
          setOpening(false)

          return
        }

        // other errors
        message.error({
          message: 'Stream On Error: ' + e.message,
          duration: 1500,
        })

        setOpening(false)

        setTimeout(() => {
          $tools.$bus.emit('closeConnection')
        }, 50)
      })
    })
  })

  const resetKeyList = usePersistFn((clearKeys = false) => {
    clearKeys && setKeyList([])
    firstPageFinished.current = false
    scanStreams.current = []
    onePageList.current = []
    onePageFinishedCount.current = 0
    setScanMoreDisabled(() => false)
  })

  const getMatchMode = usePersistFn((fillStar = true) => {
    // let match = this.$parent.$parent.$parent.$refs.operateItem.searchMatch;
    //
    // match = match || '*';
    //
    // if (fillStar && !match.match(/\*/)) {
    //   match = (`*${match}*`);
    // }
    //
    // return match;
    return '*'
  })

  const removeKeyFromKeyList = usePersistFn((key) => {
    if (!keyList || keyList.length === 0) {
      return false
    }

    for (let i = 0; i < keyList.length; i++) {
      if (keyList[i].equals(key)) {
        setKeyList((k) => k.splice(i, 1))
        break
      }
    }
  })

  useImperativeHandle(ref, () => ({
    initShow,
    resetKeyList,
  }))

  useMount(() => {
    $tools.$bus.on($tools.EventTypes.RefreshKeyList, ({ client: c, key, type = 'del' }) => {
      if (client !== c) {
        return
      }
      if (!key) {
        return refreshKeyList()
      }
      if (type === 'del') {
        removeKeyFromKeyList(key)
      }
      if (type === 'add') {
        setKeyList((k) => [...k, key])
      }
    })
  })

  return (
    <>
      <KeyListTree client={client} config={config} keyList={keyList} />
      <Button
        type="ghost"
        block={true}
        size="small"
        disabled={scanMoreDisabled}
        onClick={() => {
          refreshKeyList(false)
        }}
      >
        {i18n.$t('load_more_keys')}
      </Button>
    </>
  )
}

export const KeyList = forwardRef(KeyListInner)
