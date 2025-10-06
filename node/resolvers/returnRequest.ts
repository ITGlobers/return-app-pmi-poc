import type { QueryReturnRequestArgs } from 'baranda.return-app-pmi'

import { returnRequestService } from '../services/returnRequestService'

export const returnRequest = async (
  _: unknown,
  { requestId }: QueryReturnRequestArgs,
  ctx: Context
) => {
  return returnRequestService(ctx, requestId)
}
