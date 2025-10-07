import React, { useEffect, useState } from 'react'
import type { RouteComponentProps } from 'react-router'
import { useQuery } from 'react-apollo'
import { PageHeader, PageBlock } from 'vtex.styleguide'
import { useRuntime } from 'vtex.render-runtime'

import { StoreSettingsPovider } from '../provider/StoreSettingsProvider'
import { OrderToReturnProvider } from '../provider/OrderToReturnProvider'
import { useReturnRequest } from '../hooks/useReturnRequest'
import PRODUCTS_AVAILABLE_FOR_INDEPENDENT_RETURN from './graphql/getProductsAvailableForIndependentReturn.gql'
import { useStoreSettings } from '../hooks/useStoreSettings'
import { OrderDetailsLoader } from './components/loaders/OrderDetailsLoader'
import { ReturnIndividualDetails } from './components/ReturnIndividualDetail'

export type Page = 'form-details' | 'submit-form'

type RouteProps = RouteComponentProps<{ orderId: string }>

const createPageHeaderProps = (navigate: any) => {
  return {
    title: "Return Request",
    linkLabel: "My Returns",
    onLinkClick: () => {
      navigate({
        to: '#/my-returns',
      })
    },
  }
}

export const CreateIndividualReturnRequest = (props: RouteProps) => {
  const [items, setItemsToReturn] = useState<ItemToReturn[]>([])

  const {
    actions: { updateReturnRequest },
  } = useReturnRequest()

  const { data: storeSettings } = useStoreSettings()
  const { paymentOptions } = storeSettings ?? {}
  const { enablePaymentMethodSelection } = paymentOptions ?? {}

  const { navigate } = useRuntime()

  const { data, loading, error } = useQuery(PRODUCTS_AVAILABLE_FOR_INDEPENDENT_RETURN, {
    fetchPolicy: 'no-cache',
  })

  console.log('data', data)

  useEffect(() => {
    if (!data || !storeSettings) {
      return
    }

    const { productsAvailableForIndependentReturn } = data

    const itemsToReturn = productsAvailableForIndependentReturn.map((item: any) => {
      const quantityAvailable = item.purchaseHistory.reduce(
        (acc: number, curr: any) => acc + curr.quantityPurchased,
        0
      )

      console.log('quantityAvailable', quantityAvailable)

      return {
        id: item.skuId,
        quantityAvailable,
        isExcluded: false,
        name: item.name,
        imageUrl: item.imageUrl,
      }
    })

    setItemsToReturn(itemsToReturn)

    // const { clientProfileData, shippingData } = orderToReturnSummary

    // const initialPickupAddress = setInitialPickupAddress(shippingData)

    // updateReturnRequest({
    //   type: 'newReturnRequestState',
    //   payload: {
    //     orderId: id,
    //     customerProfileData: clientProfileData,
    //     pickupReturnData: initialPickupAddress,
    //     items: itemsToReturn.map(({ orderItemIndex }) => ({
    //       orderItemIndex,
    //       quantity: 0,
    //     })),
    //     refundPaymentData: enablePaymentMethodSelection
    //       ? undefined
    //       : {
    //           refundPaymentMethod: 'sameAsPurchase',
    //         },
    //   },
    // })
  }, [data, storeSettings, updateReturnRequest, enablePaymentMethodSelection])

  const handlePageChange = (_selectedPage: Page) => {
    // TODO: Implement page navigation for independent returns
  }

  return (
    <div className="create-return-request__container">
      CUSTOMMMMM
      <PageBlock>
        <PageHeader {...createPageHeaderProps(navigate)} />
        <OrderDetailsLoader data={{ loading, error }}>
          <ReturnIndividualDetails
            {...props}
            onPageChange={handlePageChange}
            items={items}
          />
        </OrderDetailsLoader>
      </PageBlock>
    </div>
  )
}

export const CreateIndividualReturnRequestContainer = (props: RouteProps) => {
  return (
    <StoreSettingsPovider>
      <OrderToReturnProvider>
        <CreateIndividualReturnRequest {...props} />
      </OrderToReturnProvider>
    </StoreSettingsPovider>
  )
}
