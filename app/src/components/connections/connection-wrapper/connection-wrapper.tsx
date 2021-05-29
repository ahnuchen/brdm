import React from 'react'

interface ConnectionWrapperProps {
  index?: string
  config?: ConnectionConfig
}

export const ConnectionWrapper = ({ index, config }: ConnectionWrapperProps): JSX.Element => {
  return <div>{config?.name || config?.connectionName}</div>
}
