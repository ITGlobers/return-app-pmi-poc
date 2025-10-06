import React, { useEffect, useState } from 'react'
import type { RouteComponentProps } from 'react-router'
import { useQuery } from 'react-apollo'
import type {
  OrderToReturnSummary,
  QueryOrderToReturnSummaryArgs,
} from 'baranda.return-app-pmi'
import { PageHeader, PageBlock } from 'vtex.styleguide'
import { useRuntime } from 'vtex.render-runtime'

import { StoreSettingsPovider } from '../provider/StoreSettingsProvider'
import { OrderToReturnProvider } from '../provider/OrderToReturnProvider'
import { ReturnDetails } from './components/ReturnDetails'
import { ConfirmAndSubmit } from './components/ConfirmAndSubmit'
import { useReturnRequest } from '../hooks/useReturnRequest'
import PRODUCTS_AVAILABLE_FOR_INDEPENDENT_RETURN from './graphql/getProductsAvailableForIndependentReturn.gql'
import ORDER_TO_RETURN_SUMMARY from './graphql/getOrderToReturnSummary.gql'
import { formatItemsToReturn } from '../utils/formatItemsToReturn'
import { setInitialPickupAddress } from '../utils/setInitialPickupAddress'
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

  const [page, setPage] = useState<Page>('form-details')
  const [items, setItemsToReturn] = useState<ItemToReturn[]>([])

  const {
    actions: { updateReturnRequest },
  } = useReturnRequest()

  const { data: storeSettings } = useStoreSettings()
  const { paymentOptions, options } = storeSettings ?? {}
  const { enablePaymentMethodSelection } = paymentOptions ?? {}
  const { enableHighlightFormMessage } = options ?? {}

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

  const handlePageChange = (selectedPage: Page) => {
    setPage(selectedPage)
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
