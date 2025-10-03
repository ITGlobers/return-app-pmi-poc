import { ResolverError } from '@vtex/api'
import type { ProductSummary } from 'vtex.return-app'

import { SETTINGS_PATH } from '../utils/constants'
import { getCurrentDate, substractDays } from '../utils/dateHelpers'

interface PurchasedSku {
  skuId: string
  orders: Array<{
    orderId: string
    purchaseDate: string
    quantityPurchased: number
    pricePaid: number
  }>
}

export const productsAvailableForIndependentReturn = async (
  _: unknown,
  args: { searchTerm?: string; storeUserEmail?: string },
  ctx: Context
): Promise<ProductSummary[]> => {
  const {
    state: { userProfile },
    clients: { appSettings, oms, catalog },
  } = ctx

  const { searchTerm, storeUserEmail } = args

  const settings = await appSettings.get(SETTINGS_PATH, true)

  if (!settings) {
    throw new ResolverError('Return App settings is not configured', 500)
  }

  const { maxDays } = settings
  const { email } = userProfile ?? {}

  const userEmail = storeUserEmail ?? email

  if (!userEmail) {
    throw new ResolverError('Missing user email', 400)
  }

  // Fetch all orders for the user within the maxDays window
  // Note: OMS API limits per_page to 10, so we need to paginate
  const currentDate = getCurrentDate()

  const allOrders = []
  let currentPage = 1
  let hasMore = true

  while (hasMore) {
    const { list: orders, paging } = await oms.listOrdersWithParams({
      clientEmail: userEmail,
      orderBy: 'creationDate,desc' as const,
      f_status: 'invoiced' as const,
      f_creationDate: `creationDate:[${substractDays(
        currentDate,
        maxDays
      )} TO ${currentDate}]`,
      page: currentPage,
      per_page: 10 as const,
    })

    allOrders.push(...orders)

    // Check if there are more pages
    hasMore = paging.total > currentPage * paging.perPage
    currentPage++

    // Safety limit to avoid infinite loops
    if (currentPage > 10) break
  }

  const orders = allOrders

  // Build a map of SKUs purchased by the user
  const purchasedSkusMap = new Map<string, PurchasedSku>()

  for (const order of orders) {
    const orderDetails = await oms.order(order.orderId)

    for (const item of orderDetails.items) {
      const skuId = item.id

      if (!purchasedSkusMap.has(skuId)) {
        purchasedSkusMap.set(skuId, {
          skuId,
          orders: [],
        })
      }

      purchasedSkusMap.get(skuId)!.orders.push({
        orderId: orderDetails.orderId,
        purchaseDate: orderDetails.creationDate,
        quantityPurchased: item.quantity,
        pricePaid: item.sellingPrice,
      })
    }
  }

  // Convert map to array
  let purchasedSkus = Array.from(purchasedSkusMap.values())

  // If there's a search term, we'll filter after enriching with catalog data
  // Enrich SKUs with catalog information
  const productSummaries: ProductSummary[] = []

  for (const purchasedSku of purchasedSkus) {
    try {
      // Fetch SKU data from catalog
      const skuData = await catalog.getProductBySKU(purchasedSku.skuId)

      if (!skuData) {
        continue
      }

      const {
        productName,
        items: skuItems,
        productId,
        productReference,
      } = skuData

      const skuItem = skuItems?.[0]

      if (!skuItem) {
        continue
      }

      const { sellers, images } = skuItem

      const seller = sellers?.[0]

      if (!seller) {
        continue
      }

      const imageUrl = images?.[0]?.imageUrl ?? ''

      // Apply search filter if provided
      if (
        searchTerm &&
        !productName.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        continue
      }

      productSummaries.push({
        skuId: purchasedSku.skuId,
        name: productName,
        imageUrl,
        currentPrice: seller.commertialOffer?.Price
          ? Math.round(seller.commertialOffer.Price * 100)
          : 0,
        productId,
        refId: productReference ?? '',
        sellerId: seller.sellerId,
        sellerName: seller.sellerName ?? seller.sellerId,
        purchaseHistory: purchasedSku.orders.map((order) => ({
          orderId: order.orderId,
          purchaseDate: order.purchaseDate,
          quantityPurchased: order.quantityPurchased,
          pricePaid: order.pricePaid,
        })),
      })
    } catch (error) {
      // Skip SKUs that fail to fetch from catalog
      continue
    }
  }

  return productSummaries
}
