import React from 'react'
import type { ChangeEvent } from 'react'
import { useIntl, defineMessages, FormattedMessage } from 'react-intl'
import { Input, RadioGroup } from 'vtex.styleguide'
import { PaymentMethodsOptions } from './useIndividualListReturn'
import { CustomMessage } from '../layout/CustomMessage'
import { isValidIBANNumber } from '../../../utils/isValidIBANNumber'

interface Props {
  paymentData: PaymentReturnData
  enablePaymentMethodSelection: boolean
  errors: string[]
  paymentMethods: () => PaymentMethodsOptions[]
  handleRefundPaymentChange: (event: ChangeEvent<HTMLInputElement>) => void
  handleBankDetailsChange: (event: ChangeEvent<HTMLInputElement>) => void
}

const messages = defineMessages({
  formIBAN: { id: 'store/return-app.return-order-details.payment-method.iban' },
  formAccountHolder: {
    id: 'store/return-app.return-order-details.payment-method.account-holder',
  },
})

export const PaymentMethods = ({
  paymentData,
  enablePaymentMethodSelection,
  errors,
  paymentMethods,
  handleRefundPaymentChange,
  handleBankDetailsChange,
}: Props) => {
  const { formatMessage } = useIntl()

  const { refundPaymentMethod, iban, accountHolderName } = paymentData

  const paymentMethodError = errors.some(
    (error) => error === 'refund-payment-data'
  )

  const bankDetailsError = errors.some((error) => error === 'bank-details')

  return (
    <div
      className={`flex-ns flex-wrap flex-auto flex-column pa4 mb6`}
    >
      <p>
        <FormattedMessage id="store/return-app.return-order-details.payment-method.description" />
      </p>
      {!enablePaymentMethodSelection ? (
        <p className="i-s">
          <FormattedMessage id="store/return-app.return-order-details.payment-method.default" />
        </p>
      ) : (
        <>
          <RadioGroup
            hideBorder
            name="refundPaymentMethod"
            options={paymentMethods()}
            value={refundPaymentMethod}
            onChange={handleRefundPaymentChange}
          />
          {paymentMethodError && !refundPaymentMethod ? (
            <CustomMessage
              status="error"
              message={
                <FormattedMessage id="store/return-app.return-payment-methods.input-payment-method.error" />
              }
            />
          ) : null}
        </>
      )}
      {refundPaymentMethod === 'bank' ? (
        <div>
          <div className="flex-ns flex-wrap flex-auto flex-column mt6 mw6">
            <Input
              name="accountHolderName"
              placeholder={formatMessage(messages.formAccountHolder)}
              onChange={handleBankDetailsChange}
              value={accountHolderName}
            />
            {bankDetailsError && !accountHolderName ? (
              <CustomMessage
                status="error"
                message={
                  <FormattedMessage id="store/return-app.return-payment-methods.input-account-holder.error" />
                }
              />
            ) : null}
          </div>
          <div className="flex-ns flex-wrap flex-auto flex-column mt4 mw6">
            <Input
              name="iban"
              placeholder={formatMessage(messages.formIBAN)}
              onChange={handleBankDetailsChange}
              value={iban}
            />
            {bankDetailsError && !iban ? (
              <CustomMessage
                status="error"
                message={
                  <FormattedMessage id="store/return-app.return-payment-methods.input-iban.error" />
                }
              />
            ) : null}
            {bankDetailsError &&
            iban &&
            !isValidIBANNumber(iban) ? (
              <CustomMessage
                status="error"
                message={
                  <FormattedMessage id="store/return-app.return-payment-methods.input-iban-invalid.error" />
                }
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
