import React, { Component, forwardRef, Ref, useEffect, useImperativeHandle, useReducer, useState } from 'react'
import { usePersistFn } from 'ahooks'
import { Readable } from 'stream'
import { i18n } from '@/src/i18n/i18n'
import { message } from 'antd'
import { NormalKeyList } from '@/src/components/key-list/normal-key-list'

interface KeyListProps {
  config: ConnectionConfig
  client: IORedisClient
}

function KeyListInner({ config, client }: KeyListProps, ref: Ref<any>): JSX.Element {
  const [scanStreams, setScanStreams] = useState<Readable[]>([])
  const [keyList, setKeyList] = useState<any[]>(() => [])
  const [onePageList, setOnePageList] = useState<any[]>(() => [])
  const [onePageFinishedCount, setOnePageFinishedCount] = useState(0)
  const [keysPageSize, setKeysPageSize] = useState(3)
  const [searchPageSize, setSearchPageSize] = useState(10000)
  const [scanningCount, setScanningCount] = useState(0)
  const [scanMoreDisabled, setScanMoreDisabled] = useState(false)
  const [firstPageFinished, setFirstPageFinished] = useState(false)
  const initShow = usePersistFn(() => {
    refreshKeyList()
  })
  const refreshKeyList = usePersistFn((resetKeyListPrevious = true) => {
    // reset previous list, not append mode
    resetKeyListPrevious && resetKeyList()

    // extract search

    // search loading

    // init scanStream
    if (!scanStreams.length) {
      initScanStreamsAndScan()
    }

    // scan more, resume previous scanStream
    else {
      // reset one page scan param
      setOnePageList([])
      setOnePageFinishedCount(0)

      for (const stream of scanStreams) {
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
    setScanningCount(nodes.length)

    let scanningCount = nodes.length
    let onePageList: any[] = []
    let keyList: any[] = []
    let onePageFinishedCount = 0
    let firstPageFinished = false

    nodes.map((node) => {
      const scanOption = {
        match: getMatchMode(),
        count: keysPageSize,
      }

      // scan count is bigger when in search mode
      scanOption.match != '*' && (scanOption.count = searchPageSize)

      // @ts-ignore
      const stream = node.scanBufferStream(scanOption) as Readable
      setScanStreams(scanStreams.concat(scanStreams))

      stream.on('data', (keys) => {
        onePageList = onePageList.concat(keys)
        setOnePageList(onePageList)
        // scan once reaches page size
        if (onePageList.length >= keysPageSize) {
          // temp stop
          stream.pause()
          // search input icon recover

          // last node refresh keylist
          if (++onePageFinishedCount >= scanningCount) {
            // clear key list only after data scaned, to prevent list jitter
            if (!firstPageFinished) {
              setFirstPageFinished(true)
              setKeyList(() => [])
            }

            // this page key list append to raw key list
            keyList = keyList.concat(onePageList.sort())
            setKeyList(keyList)
          }
        }
      })
      stream.on('end', () => {
        // all nodes scan finished(cusor back to 0)
        setScanningCount(scanningCount)
        scanningCount = scanningCount - 1
        if (scanningCount <= 0) {
          // clear key list only after data scaned, to prevent list jitter
          if (!firstPageFinished) {
            firstPageFinished = true
            setFirstPageFinished(true)
            keyList = []
            setKeyList(() => [])
          }

          // this page key list append to raw key list

          keyList = keyList.concat(onePageList.sort())
          setKeyList(keyList)
          setScanMoreDisabled(true)
          // search input icon recover
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

          return
        }

        // other errors
        message.error({
          message: 'Stream On Error: ' + e.message,
          duration: 1500,
        })

        setTimeout(() => {
          $tools.$bus.emit('closeConnection')
        }, 50)
      })
    })
  })

  const resetKeyList = usePersistFn((clearKeys = false) => {
    clearKeys && setKeyList([])
    setFirstPageFinished(false)
    setScanStreams([])
    setOnePageList([])
    setOnePageFinishedCount(0)
    setScanMoreDisabled(false)
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

  useImperativeHandle(ref, () => ({
    initShow,
  }))

  return <NormalKeyList keyList={keyList} />
}

export const KeyList = forwardRef(KeyListInner)
