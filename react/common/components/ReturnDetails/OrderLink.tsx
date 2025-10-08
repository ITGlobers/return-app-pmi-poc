import React from 'react'
import { Link } from 'vtex.styleguide'
import { useRuntime } from 'vtex.render-runtime'
import { defineMessages, useIntl } from 'react-intl'

import { useReturnDetails } from '../../hooks/useReturnDetails'

const messages = defineMessages({
  independent: {
    id: 'store/return-app.return-request-details.order-id.independent',
    defaultMessage: 'Independent Return',
  },
  link: {
    id: 'store/return-app.return-request-details.order-id.link',
    defaultMessage: 'Order {orderId}',
  },
})

export const OrderLink = () => {
  const intl = useIntl()
  const { data } = useReturnDetails()
  const {
    route: { domain },
  } = useRuntime()

  if (!data) return null

  const isAdmin = domain === 'admin'
  const { orderId } = data.returnRequestDetails

  // Independent returns don't have orderId
  if (!orderId) {
    return <span>{intl.formatMessage(messages.independent)}</span>
  }

  const targetHref = isAdmin
    ? `/admin/checkout/#/orders/${orderId}`
    : `/account/#/orders/${orderId}`

  return (
    <Link href={targetHref} target="_blank">
      {intl.formatMessage(messages.link, { orderId })}
    </Link>
  )
}
