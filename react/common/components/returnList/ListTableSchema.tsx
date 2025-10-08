import React from 'react'
import { FormattedDate, defineMessages, useIntl } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'
import { IconInfo, ButtonPlain, Tooltip } from 'vtex.styleguide'

import { renderStatus } from '../RenderStatus'

const messages = defineMessages({
  returnId: {
    id: 'admin/return-app.return-request-list.table-data.requestId',
    defaultMessage: 'Return ID',
  },
  returnIdTooltip: {
    id: 'admin/return-app.return-request-list.table-data.requestId.tooltip',
    defaultMessage: 'Customers can see their request ID inside the request details',
  },
  sequenceNumber: {
    id: 'store/return-app.return-request-list.table-data.sequenceNumber',
    defaultMessage: 'Sequence Number',
  },
  orderId: {
    id: 'store/return-app.return-request-list.table-data.orderId',
    defaultMessage: 'Order ID',
  },
  createdDate: {
    id: 'store/return-app.return-request-list.table-data.createdDate',
    defaultMessage: 'Created Date',
  },
  status: {
    id: 'store/return-app.return-request-list.table-data.status',
    defaultMessage: 'Status',
  },
})

const ReturnListSchema = () => {
  const intl = useIntl()
  const {
    navigate,
    route: { domain },
  } = useRuntime()

  const isAdmin = domain === 'admin'

  const navigateToRequest = (id: string) => {
    const page = isAdmin
      ? `/admin/app/returns/${id}/details/`
      : `#/my-returns/details/${id}`

    navigate({
      to: page,
    })
  }

  return {
    properties: {
      ...(isAdmin && {
        id: {
          title: intl.formatMessage(messages.returnId),
          headerRenderer({ title }) {
            return (
              <div className="flex items-center">
                {title}
                <Tooltip label={intl.formatMessage(messages.returnIdTooltip)}>
                  <span className="yellow pointer ml3 flex">
                    <IconInfo />
                  </span>
                </Tooltip>
              </div>
            )
          },
          minWidth: 310,
          cellRenderer({ cellData }) {
            return (
              <ButtonPlain
                size="small"
                onClick={() => navigateToRequest(cellData)}
              >
                {cellData}
              </ButtonPlain>
            )
          },
        },
      }),
      sequenceNumber: {
        title: intl.formatMessage(messages.sequenceNumber),
        minWidth: 100,
        ...(!isAdmin && {
          cellRenderer({ cellData, rowData }) {
            return (
              <ButtonPlain onClick={() => navigateToRequest(rowData.id)}>
                {cellData}
              </ButtonPlain>
            )
          },
        }),
      },
      orderId: {
        title: intl.formatMessage(messages.orderId),
        minWidth: 160,
      },
      createdIn: {
        title: intl.formatMessage(messages.createdDate),
        cellRenderer({ cellData }) {
          return (
            <FormattedDate
              value={cellData}
              day="2-digit"
              month="2-digit"
              year="numeric"
            />
          )
        },
        minWidth: 110,
      },
      status: {
        title: intl.formatMessage(messages.status),
        minWidth: 250,
        cellRenderer({ cellData }) {
          return renderStatus(cellData)
        },
      },
    },
  }
}

export default ReturnListSchema
