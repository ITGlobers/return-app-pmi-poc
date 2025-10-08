import React from 'react'
import type { ChangeEvent } from 'react'
import { useIntl, defineMessages, FormattedMessage } from 'react-intl'
import { Input } from 'vtex.styleguide'
import { CustomMessage } from '../layout/CustomMessage'

const messages = defineMessages({
  nameInput: {
    id: 'store/return-app.return-order-details.inputs.name-input',
  },
  emailInput: {
    id: 'store/return-app.return-order-details.inputs.email-input',
  },
  phoneInput: {
    id: 'store/return-app.return-order-details.inputs.phone-input',
  },
})

interface Props {
  customerProfileData: ContactReturnInformation
  errors: string[]
  handleContactInputChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export const ContactDetails = ({
  customerProfileData,
  errors,
  handleContactInputChange
}: Props) => {

  const { name, email, phone } = customerProfileData

  const { formatMessage } = useIntl()

  const contactError = errors.some((error) => error === 'customer-data')

  return (
    <div
      className={`flex-ns flex-wrap flex-auto flex-column pa4`}
    >
      <p>
        <FormattedMessage id="store/return-app.return-order-details.title.contact-details" />
      </p>
      <div className={`mb4`}>
        <Input
          name="name"
          required
          placeholder={formatMessage(messages.nameInput)}
          onChange={handleContactInputChange}
          value={name}
        />
        {contactError && !name ? (
          <CustomMessage
            status="error"
            message={
              <FormattedMessage id="store/return-app.return-contact-details.name-input.error" />
            }
          />
        ) : null}
      </div>
      <div className={`mb4`}>
        <Input
          readOnly
          name="email"
          placeholder={formatMessage(messages.emailInput)}
          value={email}
        />
      </div>
      <div className={`mb4`}>
        <Input
          name="phone"
          required
          placeholder={formatMessage(messages.phoneInput)}
          onChange={handleContactInputChange}
          value={phone}
          maxLength={50}
        />
        {contactError && !phone ? (
          <CustomMessage
            status="error"
            message={
              <FormattedMessage id="store/return-app.return-contact-details.phone-input.error" />
            }
          />
        ) : null}
      </div>
    </div>
  )
}
