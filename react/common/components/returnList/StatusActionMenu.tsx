import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import type { Status } from 'baranda.return-app-pmi'
import { ActionMenu } from 'vtex.styleguide'

import type { FilterKeys } from './ListTableFilter'

interface Props {
  handleOnChange: (key: FilterKeys, value: string) => void
  status: Status | ''
  disabled: boolean
}

const allStatusKey = 'allStatus'

const keyedStatusMessages = defineMessages({
  [allStatusKey]: {
    id: 'store/return-app.return-request-list.table.status.allStatus',
    defaultMessage: 'Status',
  },
  new: {
    id: 'store/return-app.return-request-list.table.status.new',
    defaultMessage: 'New',
  },
  processing: {
    id: 'store/return-app.return-request-list.table.status.processing',
    defaultMessage: 'Processing',
  },
  pickedUpFromClient: {
    id: 'store/return-app.return-request-list.table.status.pickedup-from-client',
    defaultMessage: 'Picked up from customer',
  },
  pendingVerification: {
    id: 'store/return-app.return-request-list.table.status.pending-verification',
    defaultMessage: 'Pending verification',
  },
  packageVerified: {
    id: 'store/return-app.return-request-list.table.status.package-verified',
    defaultMessage: 'Package verified',
  },
  denied: {
    id: 'store/return-app.return-request-list.table.status.denied',
    defaultMessage: 'Denied',
  },
  cancelled: {
    id: 'store/return-app.return-request-list.table.status.cancelled',
    defaultMessage: 'Cancelled',
  },
  amountRefunded: {
    id: 'store/return-app.return-request-list.table.status.refunded',
    defaultMessage: 'Refunded',
  },
})

const StatusActionMenu = (props: Props) => {
  const { handleOnChange, status, disabled } = props

  const { formatMessage } = useIntl()

  const optionList = Object.keys(keyedStatusMessages).map((key) => {
    const keyName = key === allStatusKey ? '' : key

    return {
      label: formatMessage(keyedStatusMessages[key]),
      onClick: () => handleOnChange('status', keyName),
    }
  })

  return (
    <ActionMenu
      label={
        status
          ? formatMessage(keyedStatusMessages[status])
          : formatMessage(keyedStatusMessages[allStatusKey])
      }
      align="right"
      buttonProps={{
        variation: 'secondary',
        size: 'small',
        disabled,
      }}
      options={optionList}
    />
  )
}

export { StatusActionMenu }
