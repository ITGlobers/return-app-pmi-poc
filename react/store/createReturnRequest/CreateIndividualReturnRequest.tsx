import React from 'react'
import { PageHeader, PageBlock, Divider, Button } from 'vtex.styleguide'
import { StoreSettingsPovider } from '../provider/StoreSettingsProvider'
import { OrderToReturnProvider } from '../provider/OrderToReturnProvider'
import { OrderDetailsLoader } from './components/loaders/OrderDetailsLoader'
import useIndividualListReturn from './components/IndividualReturn/useIndividualListReturn'
import { ItemsList } from './components/IndividualReturn/ItemsList'
import { ContactDetails } from './components/IndividualReturn/ContactDetails'
import { AddressDetails } from './components/IndividualReturn/AddressDetails'
import { UserCommentDetails } from './components/IndividualReturn/UserCommentDetails'
import { TermsAndConditions } from './components/IndividualReturn/TermsAndConditions'
import styles from './components/IndividualReturn/styles.css'
import { PaymentMethods } from './components/IndividualReturn/PaymentMethods'

export const CreateIndividualReturnRequest = () => {

  const {
    items,
    loading,
    error,
    handles,
    contactInformation,
    shippingData,
    userComment,
    paymentData,
    enablePaymentMethodSelection,
    areTermsAccepted,
    errors,
    returnData,
    returnLoading,
    createPageHeaderProps,
    handleUpdateItemQuantity,
    handleItemReasonChange,
    handleItemSelection,
    handleContactInputChange,
    handleShippingInputChange,
    handleCommentChange,
    paymentMethods,
    handleRefundPaymentChange,
    handleBankDetailsChange,
    handlesTermsAndConditions,
    createReturnRequest,
  } = useIndividualListReturn()

  return (
    <div className="create-return-request__container">
      <PageBlock>
        <PageHeader {...createPageHeaderProps()} />
        <OrderDetailsLoader data={{ loading, error }}>
          <div className={`${handles.returnDetailsContainer} mb5`}>
            <div className="w-100 mt4">
              <div className="f4 mb5 fw5">
                Select the products you want to refund
              </div>
            </div>
          </div>
          <ItemsList
            items={items}
            errors={errors}
            handleUpdateItemQuantity={handleUpdateItemQuantity}
            handleItemReasonChange={handleItemReasonChange}
            handleItemSelection={handleItemSelection}
          />
          <div className="mb8">
            <Divider orientation="horizontal" />
          </div>
          <div className="w-100">
            <div className="f4 fw5">
              Contact Details
            </div>
          </div>
          <div className="flex-ns flex-wrap flex-row">
            <ContactDetails
              customerProfileData={contactInformation}
              errors={errors}
              handleContactInputChange={handleContactInputChange}
            />
            <AddressDetails
              shippingData={shippingData}
              errors={errors}
              handleShippingInputChange={handleShippingInputChange}
            />
            <UserCommentDetails
              userComment={userComment}
              handleCommentChange={handleCommentChange}
            />
          </div>
          <div className="mv8">
            <Divider orientation="horizontal" />
          </div>
          <div className="w-100">
            <div className="f4 fw5">
              Payment Section
            </div>
            <PaymentMethods
              paymentData={paymentData}
              enablePaymentMethodSelection={enablePaymentMethodSelection}
              errors={errors}
              paymentMethods={paymentMethods}
              handleRefundPaymentChange={handleRefundPaymentChange}
              handleBankDetailsChange={handleBankDetailsChange}
            />
          </div>
          <TermsAndConditions
            areTermsAccepted={areTermsAccepted}
            errors={errors}
            handlesTermsAndConditions={handlesTermsAndConditions}
          />
          <div className={`${styles.processButton} flex justify-center mt6`}>
            <Button
              onClick={createReturnRequest}
              isLoading={returnLoading || returnData}
              disabled={returnLoading || returnData}
            >
              Process Return
            </Button>
          </div>
        </OrderDetailsLoader>
      </PageBlock>
    </div>
  )
}

export const CreateIndividualReturnRequestContainer = () => {
  return (
    <StoreSettingsPovider>
      <OrderToReturnProvider>
        <CreateIndividualReturnRequest />
      </OrderToReturnProvider>
    </StoreSettingsPovider>
  )
}
