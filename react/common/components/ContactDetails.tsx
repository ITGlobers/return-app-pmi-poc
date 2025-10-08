import React from 'react'
import { FormattedMessage } from 'react-intl'
import { useCssHandles } from 'vtex.css-handles'

import { useReturnDetails } from '../hooks/useReturnDetails'

const CSS_HANDLES = ['contactDetailsCommonContainer'] as const

export const ContactDetails = () => {
  const handles = useCssHandles(CSS_HANDLES)

  const { data } = useReturnDetails()

  if (!data) return null

  const {
    returnRequestDetails: {
      customerProfileData: { name, email, phoneNumber },
    },
  } = data

  const messagesRoute = 'store/return-app.return-request-details.contact-details'

  return (
    <section
      className={`${handles.contactDetailsCommonContainer} flex-ns flex-wrap flex-auto flex-column pt4 pb4`}
    >
      <h3>
        <FormattedMessage
          id={`${messagesRoute}.title`}
          defaultMessage="Contact Details"
        />
      </h3>
      <div className="mb5">
        <p className="ma0">
          <FormattedMessage id={`${messagesRoute}.name`} defaultMessage="Name" />
          : {name}
        </p>
      </div>
      <div className="mb5">
        <p className="ma0">
          <FormattedMessage
            id={`${messagesRoute}.email`}
            defaultMessage="Email"
          />
          : {email}
        </p>
      </div>
      <div className="mb5">
        <p className="ma0">
          <FormattedMessage
            id={`${messagesRoute}.phone`}
            defaultMessage="Phone"
          />
          : {phoneNumber}
        </p>
      </div>
    </section>
  )
}
