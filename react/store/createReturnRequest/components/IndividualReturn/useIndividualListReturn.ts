import { useEffect, useState } from 'react'
import { useQuery, useMutation } from 'react-apollo'
import { useRuntime } from 'vtex.render-runtime'
import { useOrderForm } from 'vtex.order-manager/OrderForm'
import { useCssHandles } from 'vtex.css-handles'
import { useStoreSettings } from '../../../hooks/useStoreSettings'
import PRODUCTS_AVAILABLE_FOR_INDEPENDENT_RETURN from '../../graphql/getProductsAvailableForIndependentReturn.gql'
import CREATE_RETURN from '../../graphql/createReturnRequest.gql'

const CSS_HANDLES = [
  'returnDetailsContainer',
  'orderIdDetailsWrapper',
  'creationDateDetailsWrapper',
  'highlightedFormMessage',
] as const

export default function useIndividualListReturn() {
  const handles = useCssHandles(CSS_HANDLES)
  const { navigate } = useRuntime()
  const { orderForm } = useOrderForm()
  const { loggedIn } = orderForm

  const { data, loading, error } = useQuery(PRODUCTS_AVAILABLE_FOR_INDEPENDENT_RETURN, {
    fetchPolicy: 'no-cache',
  })
  const [createReturn, { data: returnData, loading: returnLoading }] = useMutation(CREATE_RETURN);

  const { data: storeSettings } = useStoreSettings()  

  const [items, setItemsToReturn] = useState<ProductToReturn[]>([])
  const [contactInformation, setContactInformation] = useState<ContactReturnInformation>({
    name: '',
    email: '',
    phone: '',
  })
  const [shippingData, setShippingData] = useState<ShippingReturnData>({
    addressId: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    addressType: 'CUSTOMER_ADDRESS',
  });
  const [userComment, setUserComment] = useState<string>('');
  const [areTermsAccepted, setAreTermsAccepted] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);

  const createPageHeaderProps = () => {
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

  const handleUpdateItemQuantity = (itemId: string, quantity: number) => {
    const updatedItems = items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          quantityToReturn: quantity,
        }
      }
      return item
    })

    setItemsToReturn(updatedItems)
  }

  const handleItemReasonChange = (itemId: string, reason: string) => {
    const updatedItems = items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          reason,
        }
      }
      return item
    })

    setItemsToReturn(updatedItems)
  }

  const handleItemSelection = (itemId: string) => {
    const updatedItems = items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          isSelected: !item.isSelected,
        }
      }
      return item
    })

    setItemsToReturn(updatedItems)
  }

  const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setContactInformation((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleShippingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setShippingData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserComment(e.target.value);
  };

  const handlesTermsAndConditions = () => {
    setAreTermsAccepted(!areTermsAccepted);
  }

  const createReturnRequest = () => {
    let currentErrors: string[] = []

    const selectedItems = items.filter((item) => item.isSelected && item.quantityToReturn > 0)

    if (selectedItems.length === 0) {
      currentErrors.push('no-item-selected')
    }

    const hasValidContact = contactInformation.name && contactInformation.email && contactInformation.phone

    if (!hasValidContact) {
      currentErrors.push('customer-data')
    }

    const hasValidShipping = shippingData.address && shippingData.city && shippingData.state && shippingData.zipCode && shippingData.country

    if (!hasValidShipping) {
      currentErrors.push('pickup-data')
    }

    if (!areTermsAccepted) {
      currentErrors.push('terms-and-conditions')
    }

    setErrors(currentErrors)

    if (currentErrors.length > 0) {
      return
    }

    const returnRequestPayload = {
      independentReturn: true,
      items: selectedItems.map((item) => ({
        skuId: item.id,
        quantity: item.quantityToReturn,
        condition: "newWithBox",
        returnReason: {
          reason: item.reason,
        },
      })),
      customerProfileData: {
        name: contactInformation.name,
        email: contactInformation.email,
        phoneNumber: contactInformation.phone,
      },
      pickupReturnData: shippingData,
      userComment,
      refundPaymentData: {
        refundPaymentMethod: 'giftCard'
      },
      locale: "en-US"
    }

    console.log('Return Request Payload:', returnRequestPayload)
    createReturn({ variables: { returnRequest: returnRequestPayload } })
  }

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

      return {
        id: item.skuId,
        name: item.name,
        imageUrl: item.imageUrl,
        quantityToReturn: 0,
        quantityAvailable,
        price: item.currentPrice,
        reason: '',
        isSelected: false,
      }
    })

    setItemsToReturn(itemsToReturn)
  }, [data, storeSettings])

  useEffect(() => {
    if (!loggedIn || contactInformation.email) return

    const { clientProfileData } = orderForm

    setContactInformation({
      name: clientProfileData?.firstName
        ? `${clientProfileData.firstName} ${clientProfileData.lastName || ''}`
        : '',
      email: clientProfileData?.email || '',
      phone: clientProfileData?.phone || '',
    })
  }, [loggedIn])

  useEffect(() => {
    if (!loggedIn || shippingData.addressId) return

    const { shipping } = orderForm
    const { availableAddresses } = shipping

    if (availableAddresses.length === 0) return

    const selectedAddress = availableAddresses[0]

    setShippingData({
      addressId: selectedAddress.addressId,
      address: selectedAddress.street,
      city: selectedAddress.city,
      state: selectedAddress.state,
      country: selectedAddress.country,
      zipCode: selectedAddress.postalCode,
      addressType: 'CUSTOMER_ADDRESS',
    })
  }, [loggedIn])

  useEffect(() => {
    if (!returnData) return
    
    setTimeout(() => {
      window.location.href = `/account#/my-returns/details/${returnData.createReturnRequest.returnRequestId}`
      scrollTo(0, 0)
    }, 1000)
  }, [returnData])

  return {
    items,
    loading,
    error,
    handles,
    contactInformation,
    shippingData,
    userComment,
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
    handlesTermsAndConditions,
    createReturnRequest,
  }
}
