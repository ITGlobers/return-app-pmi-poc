import React from 'react'
import { Checkbox } from 'vtex.styleguide'
import { FormattedMessage } from 'react-intl'
import { CustomMessage } from '../layout/CustomMessage'

interface Props {
  areTermsAccepted: boolean
  errors: string[]
  handlesTermsAndConditions: () => void
}

export const TermsAndConditions = ({
  areTermsAccepted,
  errors,
  handlesTermsAndConditions,
}: Props) => {
  const hasntAcceptedTermsAndConditions = errors.some(
    (error) => error === 'terms-and-conditions'
  )

  return (
    <div
      className={`flex-ns flex-wrap flex-auto flex-column pa4`}
    >
      <Checkbox
        checked={areTermsAccepted}
        required
        id="agree"
        key="formAgreeCheckbox"
        label={
          <FormattedMessage
            id="store/return-app.return-order-details.terms-and-conditions.form-agree"
            values={{
              link: (
                <span>
                  <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href="#"
                  >
                    <FormattedMessage id="store/return-app.return-order-details.terms-and-conditions.link" />
                  </a>
                </span>
              ),
            }}
          />
        }
        name="agree"
        onChange={handlesTermsAndConditions}
        value={areTermsAccepted ? 'true' : 'false'}
      />
      {hasntAcceptedTermsAndConditions ? (
        <CustomMessage
          status="error"
          message={
            <FormattedMessage id="store/return-app.return-terms-and-conditions.checkbox.error" />
          }
        />
      ) : null}
    </div>
  )
}
