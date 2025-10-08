import React from 'react'
import { FormattedMessage, FormattedNumber } from 'react-intl'
import type { GiftCard, Maybe, RefundPaymentData } from 'baranda.return-app-pmi'
import { useCssHandles } from 'vtex.css-handles'
import { useRuntime } from 'vtex.render-runtime'

import { useReturnDetails } from '../../hooks/useReturnDetails'

const CSS_HANDLES = ['refundMethodDetailContainer'] as const

const messageId =
  'store/return-app.return-request-details.payent-method.refund-option'

interface RefundMethodProps {
  refundPaymentData: RefundPaymentData
  giftCard: Maybe<GiftCard> | undefined
  refundValue: Maybe<number> | undefined
  currency: string
}

const RefundPayment = (props: RefundMethodProps) => {
  const handles = useCssHandles(CSS_HANDLES)
  const {
    route: { domain },
  } = useRuntime()

  const { refundPaymentData, giftCard, refundValue, currency } = props

  const {
    refundPaymentMethod,
    iban,
    accountHolderName,
    automaticallyRefundPaymentMethod,
  } = refundPaymentData

  if (refundPaymentMethod === 'giftCard') {
    return (
      <div className={handles.refundMethodDetailContainer}>
        <p>
          <FormattedMessage
            id={`${messageId}.refund-method`}
            defaultMessage="Refund method: {refundMethod}"
            values={{
              refundMethod: (
                <FormattedMessage
                  id={`${messageId}.gift-card`}
                  defaultMessage="Gift Card"
                />
              ),
            }}
          />
        </p>
        {giftCard && refundValue ? (
          <>
            <p>
              <FormattedMessage
                id={`${messageId}.gift-card-code`}
                defaultMessage="Gift Card code: {code}"
                values={{
                  code: giftCard.redemptionCode,
                }}
              />
            </p>

            <p>
              <FormattedMessage
                id={`${messageId}.gift-card-value`}
                defaultMessage="Gift Card value: {value}"
                values={{
                  value: (
                    <FormattedNumber
                      value={refundValue / 100}
                      style="currency"
                      currency={currency}
                    />
                  ),
                }}
              />
            </p>
          </>
        ) : (
          <></>
        )}
      </div>
    )
  }

  if (refundPaymentMethod === 'bank') {
    return (
      <div>
        <p>
          <FormattedMessage
            id={`${messageId}.refund-method`}
            defaultMessage="Refund method: {refundMethod}"
            values={{
              refundMethod: (
                <FormattedMessage
                  id={`${messageId}.bank`}
                  defaultMessage="Bank Transfer"
                />
              ),
            }}
          />
        </p>
        <p>
          <FormattedMessage
            id={`${messageId}.iban`}
            defaultMessage="IBAN: {iban}"
            values={{
              iban,
            }}
          />
        </p>
        <p>
          <FormattedMessage
            id={`${messageId}.account-holder`}
            defaultMessage="Account holder: {accountHolderName}"
            values={{ accountHolderName }}
          />
        </p>
      </div>
    )
  }

  if (refundPaymentMethod === 'card') {
    return (
      <div>
        <p>
          <FormattedMessage
            id={`${messageId}.refund-method`}
            defaultMessage="Refund method: {refundMethod}"
            values={{
              refundMethod: (
                <FormattedMessage
                  id={`${messageId}.card`}
                  defaultMessage="Credit Card"
                />
              ),
            }}
          />
        </p>
      </div>
    )
  }

  if (refundPaymentMethod === 'sameAsPurchase') {
    return (
      <div>
        <p>
          <FormattedMessage
            id={`${messageId}.refund-method`}
            defaultMessage="Refund method: {refundMethod}"
            values={{
              refundMethod: (
                <FormattedMessage
                  id={`${messageId}.same-as-purchase`}
                  defaultMessage="Same as Purchase"
                />
              ),
            }}
          />
        </p>
        {domain !== 'admin' ? null : (
          <FormattedMessage
            id="store/return-app.return-request-details.payent-method.refund-option.refund-process"
            defaultMessage="Automatic refund: {automaticallyRefundPaymentMethod}"
            values={{ automaticallyRefundPaymentMethod }}
          />
        )}
      </div>
    )
  }

  return null
}

export const RefundMethodDetail = () => {
  const { data } = useReturnDetails()

  if (!data) return null

  const {
    returnRequestDetails: { refundPaymentData, refundData, cultureInfoData },
  } = data

  if (!refundPaymentData) return null

  return (
    <section>
      <h3>
        <FormattedMessage
          id="store/return-app.return-request-details.payent-method.title"
          defaultMessage="Refund Payment Method"
        />
      </h3>
      <RefundPayment
        refundPaymentData={refundPaymentData}
        giftCard={refundData?.giftCard}
        refundValue={refundData?.invoiceValue}
        currency={cultureInfoData.currencyCode}
      />
    </section>
  )
}
