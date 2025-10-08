import React from 'react'
import type { Status } from 'baranda.return-app-pmi'
import { defineMessages, useIntl } from 'react-intl'
import {
  IconClock,
  IconFailure,
  IconVisibilityOn,
  IconCheck,
  IconSuccess,
  IconExternalLinkMini,
} from 'vtex.styleguide'

const status = {
  new: 'new',
  processing: 'processing',
  picked: 'pickedUpFromClient',
  pendingVerification: 'pendingVerification',
  verified: 'packageVerified',
  denied: 'denied',
  refunded: 'amountRefunded',
  cancelled: 'cancelled',
} as const

const statusMessages = defineMessages({
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
    defaultMessage: 'Picked up from client',
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
  amountRefunded: {
    id: 'store/return-app.return-request-list.table.status.refunded',
    defaultMessage: 'Refunded',
  },
  cancelled: {
    id: 'store/return-app.return-request-list.table.status.cancelled',
    defaultMessage: 'Cancelled',
  },
})

/**
 * Renders the status with an icon and color
 */
export function renderStatus(requestStatus: Status) {
  const RenderStatusComponent = () => {
    const intl = useIntl()

    const statusConfig: Record<
      Status,
      {
        color: string
        icon: React.ReactNode
        messageKey: keyof typeof statusMessages
      }
    > = {
      [status.verified]: {
        color: 'green',
        icon: <IconSuccess size={14} />,
        messageKey: 'packageVerified',
      },
      [status.denied]: {
        color: 'red',
        icon: <IconFailure size={14} />,
        messageKey: 'denied',
      },
      [status.cancelled]: {
        color: 'red',
        icon: <IconFailure size={14} />,
        messageKey: 'cancelled',
      },
      [status.pendingVerification]: {
        color: 'yellow',
        icon: <IconClock size={14} />,
        messageKey: 'pendingVerification',
      },
      [status.processing]: {
        color: 'yellow',
        icon: <IconClock size={14} />,
        messageKey: 'processing',
      },
      [status.refunded]: {
        color: 'green',
        icon: <IconCheck size={14} />,
        messageKey: 'amountRefunded',
      },
      [status.picked]: {
        color: '',
        icon: <IconExternalLinkMini size={11} />,
        messageKey: 'pickedUpFromClient',
      },
      [status.new]: {
        color: 'green',
        icon: <IconVisibilityOn size={14} />,
        messageKey: 'new',
      },
    }

    const config = statusConfig[requestStatus] ?? statusConfig[status.new]

    return (
      <div className={`${config.color} flex items-center`}>
        <span className="mr2 flex">{config.icon}</span>
        {intl.formatMessage(statusMessages[config.messageKey])}
      </div>
    )
  }

  return <RenderStatusComponent />
}
