interface ItemToReturn {
  id: string
  quantity: number
  quantityAvailable: number
  isExcluded: boolean
  name: string
  localizedName?: string | null
  imageUrl: string
  orderItemIndex: number
}

interface ProductToReturn {
  id: string
  name: string
  imageUrl: string
  quantityToReturn: number
  quantityAvailable: number
  price: number
  reason: string
  isSelected: boolean
}

interface ContactReturnInformation {
  name: string
  email: string
  phone: string
}

interface ShippingReturnData {
  addressId: string
  address: string
  city: string
  state: string
  country: string
  zipCode: string
  addressType: string
}

interface PaymentReturnData {
  refundPaymentMethod: string
  iban: string
  accountHolderName: string
}

type MaybeGlobal<T> = T | null

type GeoCoordinates = Array<MaybeGlobal<number>>
