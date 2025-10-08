import React from 'react'
import { FormattedMessage } from 'react-intl'
import { useCssHandles } from 'vtex.css-handles'

import { useReturnDetails } from '../../hooks/useReturnDetails'

const CSS_HANDLES = ['commonPickupContainer'] as const

export const PickupAddress = () => {
  const { data } = useReturnDetails()
  const handles = useCssHandles(CSS_HANDLES)

  if (!data) return null

  const {
    returnRequestDetails: {
      pickupReturnData: { country, state, address, zipCode, city, addressType },
    },
  } = data

  const pickupAddressMessageRoute =
    'store/return-app.return-request-details.pickup-address'

  return (
    <section
      className={`${handles.commonPickupContainer} flex-ns flex-wrap flex-auto flex-column pt4 pb4`}
    >
      <h3>
        <FormattedMessage
          id={`${pickupAddressMessageRoute}.title`}
          defaultMessage="Delivery Address"
        />
      </h3>
      <div className="mb5">
        <p className="ma0">
          <FormattedMessage
            id={`${pickupAddressMessageRoute}.pickup-type`}
            defaultMessage="Pickup type"
          />
          :{' '}
          {addressType === 'PICKUP_POINT' ? (
            <FormattedMessage
              id={`${pickupAddressMessageRoute}.pickup-type.pickup-point`}
              defaultMessage="Pickup point"
            />
          ) : (
            <FormattedMessage
              id={`${pickupAddressMessageRoute}.pickup-type.customer-address`}
              defaultMessage="Customer address"
            />
          )}
        </p>
      </div>
      <div className="mb5">
        <p className="ma0">
          <FormattedMessage
            id={`${pickupAddressMessageRoute}.country`}
            defaultMessage="Country: {country}"
            values={{
              country,
            }}
          />
        </p>
      </div>
      <div className="mb5">
        <p className="ma0">
          <FormattedMessage
            id={`${pickupAddressMessageRoute}.locality`}
            defaultMessage="City: {city}"
            values={{
              city,
            }}
          />
        </p>
      </div>
      <div className="mb5">
        <p className="ma0">
          <FormattedMessage
            id={`${pickupAddressMessageRoute}.address`}
            defaultMessage="Address: {address}"
            values={{
              address,
            }}
          />
        </p>
      </div>
      <div className="mb5">
        <p className="ma0">
          <FormattedMessage
            id={`${pickupAddressMessageRoute}.state`}
            defaultMessage="State: {state}"
            values={{
              state,
            }}
          />
        </p>
      </div>
      <div className="mb5">
        <p className="ma0">
          <FormattedMessage
            id={`${pickupAddressMessageRoute}.zip`}
            defaultMessage="Postal code: {zipCode}"
            values={{
              zipCode,
            }}
          />
        </p>
      </div>
    </section>
  )
}
