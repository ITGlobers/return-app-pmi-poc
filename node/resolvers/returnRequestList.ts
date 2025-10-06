import type { QueryReturnRequestListArgs } from 'baranda.return-app-pmi'

import { returnRequestListService } from '../services/returnRequestListService'

export const returnRequestList = (
  _: unknown,
  args: QueryReturnRequestListArgs,
  ctx: Context
) => {
  return returnRequestListService(ctx, args)
}
