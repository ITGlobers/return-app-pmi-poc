import React from 'react'
import type { ChangeEvent } from 'react'
import { useIntl, defineMessages, FormattedMessage } from 'react-intl'
import { Input, Tooltip} from 'vtex.styleguide'
import { CustomMessage } from '../layout/CustomMessage'

const messages = defineMessages({
  addressInput: {
    id: 'store/return-app.return-order-details.inputs.address-input',
  },
  cityInput: {
    id: 'store/return-app.return-order-details.inputs.city-input',
  },
  stateInput: {
    id: 'store/return-app.return-order-details.inputs.state-input',
  },
  zipInput: {
    id: 'store/return-app.return-order-details.inputs.zip-input',
  },
  countryInput: {
    id: 'store/return-app.return-order-details.inputs.country-input',
  },
})

interface Props {
  shippingData: ShippingReturnData
  errors: string[]
  handleShippingInputChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export const AddressDetails = ({
  shippingData,
  errors,
  handleShippingInputChange
}: Props) => {
  const { formatMessage } = useIntl()

  const {
    address,
    city,
    state,
    zipCode,
    country,
  } = shippingData


  const addressError = errors.some((error) => error === 'pickup-data')

  return (
    <div
      className={`flex-ns flex-wrap flex-auto flex-column pa4 mw6`}
    >
      <div
        className={`flex items-center justify-between`}
      >
        <div>
          <Tooltip
            label={
              <FormattedMessage id="store/return-app.return-order-details.title.tooltip.pickup-address" />
            }
          >
            <p>
              <FormattedMessage id="store/return-app.return-order-details.title.pickup-address" />
            </p>
          </Tooltip>
        </div>
      </div>

      <div className={`mb4`}>
        <Input
          name="address"
          required
          placeholder={formatMessage(messages.addressInput)}
          onChange={handleShippingInputChange}
          value={address}
        />
        {addressError && !address ? (
          <CustomMessage
            status="error"
            message={
              <FormattedMessage id="store/return-app.return-address-details.address-input.error" />
            }
          />
        ) : null}
      </div>
      <div className={`mb4`}>
        <Input
          name="city"
          required
          placeholder={formatMessage(messages.cityInput)}
          onChange={handleShippingInputChange}
          value={city}
        />
        {addressError && !city ? (
          <CustomMessage
            status="error"
            message={
              <FormattedMessage id="store/return-app.return-address-details.city-input.error" />
            }
          />
        ) : null}
      </div>
      <div className={`mb4`}>
        <Input
          name="state"
          required
          placeholder={formatMessage(messages.stateInput)}
          onChange={handleShippingInputChange}
          value={state}
        />
        {addressError && !state ? (
          <CustomMessage
            status="error"
            message={
              <FormattedMessage id="store/return-app.return-address-details.state-input.error" />
            }
          />
        ) : null}
      </div>
      <div className={`mb4`}>
        <Input
          name="zipCode"
          required
          placeholder={formatMessage(messages.zipInput)}
          onChange={handleShippingInputChange}
          value={zipCode}
        />
        {addressError && !zipCode ? (
          <CustomMessage
            status="error"
            message={
              <FormattedMessage id="store/return-app.return-address-details.zip-input.error" />
            }
          />
        ) : null}
      </div>
      <div className={`mb4`}>
        <Input
          name="country"
          required
          placeholder={formatMessage(messages.countryInput)}
          onChange={handleShippingInputChange}
          value={country}
        />
        {addressError && !country ? (
          <CustomMessage
            status="error"
            message={
              <FormattedMessage id="store/return-app.return-address-details.country-input.error" />
            }
          />
        ) : null}
      </div>
    </div>
  )
}
