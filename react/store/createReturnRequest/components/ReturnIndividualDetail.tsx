import React from 'react'
import { FormattedMessage } from 'react-intl'
import type { RouteComponentProps } from 'react-router'
import { useCssHandles } from 'vtex.css-handles'
import { Divider, Button } from 'vtex.styleguide'
import { useRuntime } from 'vtex.render-runtime'

import { ContactDetails } from './ContactDetails'
import { UserCommentDetails } from './UserCommentDetails'
import { useReturnRequest } from '../../hooks/useReturnRequest'
import { TermsAndConditions } from './TermsAndConditions'
import type { Page } from '../CreateReturnRequest'
import { ItemsListIndividual } from './ItemsListIndividual'

const CSS_HANDLES = [
  'returnDetailsContainer',
  'orderIdDetailsWrapper',
  'creationDateDetailsWrapper',
  'highlightedFormMessage',
] as const

interface Props {
  onPageChange: (page: Page) => void
  items: ItemToReturn[]
}

export const ReturnIndividualDetails = (
  props: RouteComponentProps & Props
) => {
  const {
    onPageChange,
    items,
  } = props

  const handles = useCssHandles(CSS_HANDLES)
  const {
    actions: { areFieldsValid },
  } = useReturnRequest()

  const {
    hints: { phone },
  } = useRuntime()

  const handleFieldsValidation = () => {
    if (areFieldsValid()) {
      onPageChange('submit-form')
      typeof window !== 'undefined' && window.scrollTo(0, 0)
    }
  }

  return (
    <>
      <div className={`${handles.returnDetailsContainer} mb5`}>
        <div className="w-100 mt4">
          <div className="f4 mb5 fw5">
            Select the products you want to refund
          </div>
        </div>
      </div>
      <div className={!phone ? 'overflow-scroll' : ''}>
        <ItemsListIndividual items={items} />
      </div>
      <div className="mb8">
        <Divider orientation="horizontal" />
      </div>
      <div className="w-100">
        <div className="f4 fw5">
          Contact Details
        </div>
      </div>
      <div className="flex-ns flex-wrap flex-row">
        <ContactDetails />
        {/* <AddressDetails shippingData={shippingData} /> */}
        <UserCommentDetails />
      </div>
      <div className="mv8">
        <Divider orientation="horizontal" />
      </div>
      <div className="w-100">
        <div className="f4 fw5">
          <FormattedMessage id="store/return-app.return-order-details.section-payment" />
        </div>
      </div>
      {/* <PaymentMethods canRefundCard={canRefundCard} /> */}
      <TermsAndConditions />
      <div className="flex justify-center mt6">
        <Button onClick={handleFieldsValidation} block={phone}>
          <FormattedMessage id="store/return-app.return-order-details.button.next" />
        </Button>
      </div>
    </>
  )
}
