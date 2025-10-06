import type { ReturnRequestCreated, ReturnRequestInput } from 'baranda.return-app-pmi'
import { UserInputError, ResolverError } from '@vtex/api'
import type { DocumentResponse } from '@vtex/clients/build/clients/masterData/MasterDataEntity'

import {
  SETTINGS_PATH,
  OMS_RETURN_REQUEST_CONFIRMATION,
} from '../utils/constants'
import { validateReturnReason } from '../utils/validateReturnReason'
import { validatePaymentMethod } from '../utils/validatePaymentMethod'
import { validateCanUsedropoffPoints } from '../utils/validateCanUseDropoffPoints'
import { createRefundableTotals } from '../utils/createRefundableTotals'
import { OMS_RETURN_REQUEST_CONFIRMATION_TEMPLATE } from '../utils/templates'
import type { ConfirmationMailData } from '../typings/mailClient'
import { getCustomerEmail } from '../utils/getCostumerEmail'
import { validateItemCondition } from '../utils/validateItemCondition'
import { generateIndependentSequenceNumber } from '../utils/generateIndependentSequenceNumber'

/**
 * Service to create independent return requests (PMI feature)
 * Allows returns without being tied to a specific orderId
 */
export const createIndependentReturnRequestService = async (
  ctx: Context,
  args: ReturnRequestInput
): Promise<ReturnRequestCreated> => {
  const {
    clients: {
      returnRequest: returnRequestClient,
      appSettings,
      mail,
      catalog,
      vbase,
      oms,
    },
    state: { userProfile, appkey },
    vtex: { logger },
  } = ctx

  const {
    items,
    customerProfileData,
    pickupReturnData,
    refundPaymentData,
    userComment,
    locale,
  } = args

  if (!appkey && !userProfile) {
    throw new ResolverError('Missing appkey or userProfile')
  }

  const { firstName, lastName, email, userId } = userProfile ?? {}

  const submittedByNameOrEmail =
    firstName || lastName ? `${firstName} ${lastName}` : email

  const submittedBy = appkey ?? submittedByNameOrEmail

  if (!submittedBy) {
    throw new ResolverError(
      'Unable to get submittedBy from context. The request is missing the userProfile info or the appkey'
    )
  }

  const requestDate = new Date().toISOString()

  // Check items
  if (!items || items.length === 0) {
    throw new UserInputError('There are no items in the request')
  }

  // Validate that all items have skuId for independent returns
  for (const item of items) {
    if (!item.skuId) {
      throw new UserInputError(
        'All items must have skuId for independent returns'
      )
    }
  }

  const settings = await appSettings.get(SETTINGS_PATH, true)

  if (!settings) {
    throw new ResolverError('Return App settings is not configured', 500)
  }

  const {
    customReturnReasons,
    paymentOptions,
    options: settingsOptions,
  } = settings

  // Validate return reasons (without maxDays check since there's no order)
  validateReturnReason(items, null, customReturnReasons)

  // Validate payment methods
  // Note: For independent returns, "sameAsPurchase" doesn't make sense
  if (refundPaymentData.refundPaymentMethod === 'sameAsPurchase') {
    throw new UserInputError(
      'Payment method "sameAsPurchase" is not allowed for independent returns'
    )
  }

  validatePaymentMethod(refundPaymentData, paymentOptions)

  // Validate address type
  validateCanUsedropoffPoints(
    pickupReturnData,
    settingsOptions?.enablePickupPoints
  )

  // Validate item condition
  validateItemCondition(items, settingsOptions?.enableSelectItemCondition)

  // Generate independent sequence number
  const sequenceNumber = await generateIndependentSequenceNumber(vbase)

  // Validate that user actually purchased these SKUs
  // Get all orders from user to verify SKU ownership
  const userEmail = getCustomerEmail(
    { email: customerProfileData.email ?? email } as any,
    {
      userProfile,
      appkey,
      inputEmail: customerProfileData.email,
    },
    { logger }
  )

  // Fetch user's orders to validate SKU ownership
  // Note: OMS API limits per_page to 10, so we need to paginate
  const allUserOrders = []
  let currentPage = 1
  let hasMore = true

  while (hasMore) {
    const { list: orders, paging } = await oms.listOrdersWithParams({
      clientEmail: userEmail,
      orderBy: 'creationDate,desc' as const,
      f_status: 'invoiced' as const,
      f_creationDate: `creationDate:[1900-01-01T00:00:00.000Z TO 2099-12-31T23:59:59.999Z]`, // All dates
      page: currentPage,
      per_page: 10 as const,
    })

    allUserOrders.push(...orders)

    // Check if there are more pages
    hasMore = paging.total > currentPage * paging.perPage
    currentPage++

    // Safety limit to avoid infinite loops
    if (currentPage > 10) break
  }

  const userOrders = allUserOrders

  // Build set of purchased SKU IDs
  const purchasedSkuIds = new Set<string>()

  for (const order of userOrders) {
    const orderDetails = await oms.order(order.orderId)

    for (const orderItem of orderDetails.items) {
      purchasedSkuIds.add(orderItem.id)
    }
  }

  // Validate that all requested SKUs were purchased
  for (const item of items) {
    if (!purchasedSkuIds.has(item.skuId!)) {
      throw new UserInputError(
        `SKU ${item.skuId} was not found in user's purchase history`
      )
    }
  }

  // Fetch SKU details from catalog and build items array
  const itemsToReturn = []

  for (const item of items) {
    const skuData = await catalog.getProductBySKU(item.skuId!)

    if (!skuData) {
      throw new ResolverError(`SKU ${item.skuId} not found in catalog`)
    }

    const {
      productName,
      items: skuItems,
      productId,
      productReference,
    } = skuData

    const skuItem = skuItems?.[0]

    if (!skuItem) {
      throw new ResolverError(`SKU ${item.skuId} has no items in catalog`)
    }

    const { sellers, images, nameComplete } = skuItem
    const seller = sellers?.[0]

    if (!seller) {
      throw new ResolverError(`SKU ${item.skuId} has no sellers`)
    }

    const imageUrl = images?.[0]?.imageUrl ?? ''
    const sellingPrice = item.sellingPrice ?? Math.round((seller.commertialOffer?.Price ?? 0) * 100)

    itemsToReturn.push({
      id: item.skuId!,
      orderItemIndex: undefined, // No order item index for independent returns
      quantity: item.quantity,
      name: productName,
      localizedName: nameComplete ?? null,
      sellingPrice,
      tax: 0, // No tax info available without order
      imageUrl,
      unitMultiplier: 1,
      sellerId: seller.sellerId,
      sellerName: seller.sellerName ?? seller.sellerId,
      productId,
      refId: productReference ?? '',
      returnReason: item.returnReason,
      condition: item.condition ?? 'unspecified',
    })
  }

  // Calculate refundable amounts
  const refundableAmountTotals = createRefundableTotals(
    itemsToReturn,
    [], // No totals from order
    settingsOptions?.enableProportionalShippingValue
  )

  const refundableAmount = refundableAmountTotals.reduce(
    (amount, cur) => amount + cur.value,
    0
  )

  const userCommentData = userComment
    ? [
        {
          comment: userComment,
          createdAt: requestDate,
          submittedBy,
          visibleForCustomer: true,
          role: 'storeUser' as const,
        },
      ]
    : []

  const customerEmail = getCustomerEmail(
    { email: customerProfileData.email ?? email } as any,
    {
      userProfile,
      appkey,
      inputEmail: customerProfileData.email,
    },
    {
      logger,
    }
  )

  const { refundPaymentMethod } = refundPaymentData

  const { iban, accountHolderName, ...refundPaymentMethodSubset } =
    refundPaymentData

  const refundPaymentDataResult =
    refundPaymentMethod === 'bank'
      ? refundPaymentData
      : refundPaymentMethodSubset

  // Get currency code from first order or default to USD
  let currencyCode = 'USD'

  if (userOrders.length > 0) {
    try {
      const firstOrder = await oms.order(userOrders[0].orderId)

      currencyCode = firstOrder.storePreferencesData?.currencyCode ?? 'USD'
    } catch (error) {
      // Use default USD if unable to fetch
    }
  }

  let rmaDocument: DocumentResponse

  // Convert undefined to null for MasterData compatibility
  const itemsForMasterData = itemsToReturn.map((item) => ({
    ...item,
    orderItemIndex: item.orderItemIndex ?? null,
  }))

  try {
    rmaDocument = await returnRequestClient.save({
      orderId: null,
      independentReturn: true,
      refundableAmount,
      sequenceNumber,
      status: 'new',
      refundableAmountTotals,
      customerProfileData: {
        userId: userId ?? '',
        name: customerProfileData.name,
        email: customerEmail,
        phoneNumber: customerProfileData.phoneNumber,
      },
      pickupReturnData,
      refundPaymentData: {
        ...refundPaymentDataResult,
        automaticallyRefundPaymentMethod: false, // No automatic refund for independent returns
      },
      items: itemsForMasterData as any,
      dateSubmitted: requestDate,
      refundData: null,
      refundStatusData: [
        {
          status: 'new',
          submittedBy,
          createdAt: requestDate,
          comments: userCommentData,
        },
      ],
      cultureInfoData: {
        currencyCode,
        locale,
      },
    })
  } catch (error) {
    const mdValidationErrors = error?.response?.data?.errors[0]?.errors

    const errorMessageString = mdValidationErrors
      ? JSON.stringify(
          {
            message: 'Schema Validation error',
            errors: mdValidationErrors,
          },
          null,
          2
        )
      : error.message

    throw new ResolverError(errorMessageString, error.response?.status || 500)
  }

  // Send confirmation email
  try {
    const templateExists = await mail.getTemplate(
      OMS_RETURN_REQUEST_CONFIRMATION(locale)
    )

    if (!templateExists) {
      await mail.publishTemplate(
        OMS_RETURN_REQUEST_CONFIRMATION_TEMPLATE(locale)
      )
    }

    const mailData: ConfirmationMailData = {
      templateName: OMS_RETURN_REQUEST_CONFIRMATION(locale),
      jsonData: {
        data: {
          status: 'new',
          name: customerProfileData.name,
          DocumentId: rmaDocument.DocumentId,
          email: customerEmail,
          phoneNumber: customerProfileData.phoneNumber,
          country: pickupReturnData.country,
          locality: pickupReturnData.city,
          address: pickupReturnData.address,
          paymentMethod: refundPaymentData.refundPaymentMethod,
        },
        products: [...itemsToReturn],
        refundStatusData: [
          {
            status: 'new',
            submittedBy,
            createdAt: requestDate,
            comments: userCommentData,
          },
        ],
      },
    }

    await mail.sendMail(mailData)
  } catch (error) {
    logger.warn({
      message: `Failed to send email for independent return request ${rmaDocument.DocumentId}`,
      error,
    })
  }

  return { returnRequestId: rmaDocument.DocumentId }
}
