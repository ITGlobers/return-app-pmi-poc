import type {
  ReturnRequestItemInput,
  CustomReturnReason,
} from 'baranda.return-app-pmi'
import { ResolverError, UserInputError } from '@vtex/api'

import { isWithinMaxDaysToReturn } from './dateHelpers'

export const validateReturnReason = (
  itemsToReturn: ReturnRequestItemInput[],
  orderCreationDate: string | null,
  customReturnReasons?: CustomReturnReason[] | null
) => {
  itemsToReturn.forEach(({ returnReason: { reason }, orderItemIndex }) => {
    if (!reason) {
      throw new UserInputError(
        `Item index ${orderItemIndex} has no return reason. Reason cannot be empty.`
      )
    }
  })

  if (!customReturnReasons || customReturnReasons.length === 0) {
    return
  }

  const maxDaysPercustomReasonMap = new Map<string, number>()

  for (const customReason of customReturnReasons) {
    const { maxDays, reason, translations } = customReason

    maxDaysPercustomReasonMap.set(reason, maxDays)

    for (const { translation } of translations ?? []) {
      maxDaysPercustomReasonMap.set(translation, maxDays)
    }
  }

  for (const item of itemsToReturn) {
    const {
      orderItemIndex,
      returnReason: { reason },
    } = item

    if (reason === 'otherReason') {
      continue
    }

    const maxDayForReason = maxDaysPercustomReasonMap.get(reason)

    if (!maxDayForReason) {
      throw new ResolverError(
        `Order Item index ${orderItemIndex} doesn't have a valid return reason`,
        400
      )
    }

    // Skip date validation for independent returns (orderCreationDate is null)
    if (orderCreationDate && !isWithinMaxDaysToReturn(orderCreationDate, maxDayForReason)) {
      throw new ResolverError(
        `Order Item index ${orderItemIndex} is not within max days for the reason ${reason}`,
        400
      )
    }
  }
}
