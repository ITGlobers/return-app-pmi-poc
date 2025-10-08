import React from 'react'
import { FormattedMessage } from 'react-intl'
import { useCssHandles } from 'vtex.css-handles'

import { useReturnDetails } from '../../../hooks/useReturnDetails'
import { TotalWrapper } from './TotalWrapper'
import { TotalContainer } from './TotalContainer'

const CSS_HANDLES = ['requestedValuesContainer'] as const

export const RequestedValues = () => {
  const handles = useCssHandles(CSS_HANDLES)

  const { data } = useReturnDetails()

  if (!data) return null

  const { refundableAmountTotals, refundableAmount } = data.returnRequestDetails

  const totalRefundableItems =
    refundableAmountTotals.find(({ id }) => id === 'items')?.value ?? 0

  const totalRefundableTaxes =
    refundableAmountTotals.find(({ id }) => id === 'tax')?.value ?? 0

  const totalRefundableShipping =
    refundableAmountTotals.find(({ id }) => id === 'shipping')?.value ?? 0

  return (
    <div className={`${handles.requestedValuesContainer} mb5`}>
      <h3>
        <FormattedMessage
          id="store/return-app.return-request-details.request-total.header"
          defaultMessage="Return Request Total"
        />
      </h3>
      <TotalContainer>
        <TotalWrapper
          title={
            <FormattedMessage
              id="store/return-app.return-request-details.request-total.item-tax"
              defaultMessage="Item (with taxes)"
            />
          }
          value={totalRefundableItems + totalRefundableTaxes}
        />
        <TotalWrapper
          title={
            <FormattedMessage
              id="store/return-app.return-request-details.request-total.shipping"
              defaultMessage="Shipping"
            />
          }
          value={totalRefundableShipping}
        />
        <TotalWrapper
          title={
            <FormattedMessage
              id="store/return-app.return-request-details.request-total.total"
              defaultMessage="Total"
            />
          }
          value={refundableAmount}
        />
      </TotalContainer>
    </div>
  )
}
