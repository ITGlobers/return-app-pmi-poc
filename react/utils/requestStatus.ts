import type {
  Status,
  RefundStatusData,
  RefundStatusComment,
} from 'baranda.return-app-pmi'
import { defineMessages } from 'react-intl'

const statusSequence: Status[] = [
  'new',
  'processing',
  'pickedUpFromClient',
  'pendingVerification',
  'packageVerified',
  'amountRefunded',
]

export const statusAllowed: Record<Status, Status[]> = {
  new: ['new', 'processing', 'denied', 'cancelled'],
  processing: ['processing', 'pickedUpFromClient', 'denied', 'cancelled'],
  pickedUpFromClient: ['pickedUpFromClient', 'pendingVerification', 'denied'],
  // In this step, when sending the items to the resolver, it will assign the status denied or packageVerified based on the items sent.
  pendingVerification: ['pendingVerification'],
  packageVerified: ['packageVerified', 'amountRefunded'],
  amountRefunded: ['amountRefunded'],
  denied: ['denied'],
  cancelled: ['cancelled'],
}

export const statusMessageIdAdmin = defineMessages({
  new: { id: 'store/return-app-status.new', defaultMessage: 'New' },
  processing: { id: 'store/return-app-status.processing', defaultMessage: 'Processing' },
  pickedUpFromClient: { id: 'store/return-app-status.pickedup-from-client', defaultMessage: 'Picked up from client' },
  pendingVerification: { id: 'store/return-app-status.pending-verification', defaultMessage: 'Pending verification' },
  packageVerified: { id: 'store/return-app-status.package-verified', defaultMessage: 'Package verified' },
  amountRefunded: { id: 'store/return-app-status.refunded', defaultMessage: 'Refunded' },
  denied: { id: 'store/return-app-status.denied', defaultMessage: 'Denied' },
  cancelled: { id: 'store/return-app-status.cancelled', defaultMessage: 'Cancelled' },
})

export const timelineStatusMessageId = defineMessages({
  new: { id: 'store/return-app-status.timeline.new', defaultMessage: 'New - {ts, date, medium} {ts, time, short}' },
  processing: { id: 'store/return-app-status.timeline.processing', defaultMessage: 'Processing - {ts, date, medium} {ts, time, short}' },
  pickedUpFromClient: {
    id: 'store/return-app-status.timeline.pickedup-from-client',
    defaultMessage: 'Picked up from client - {ts, date, medium} {ts, time, short}',
  },
  pendingVerification: {
    id: 'store/return-app-status.timeline.pending-verification',
    defaultMessage: 'Pending verification - {ts, date, medium} {ts, time, short}',
  },
  packageVerified: { id: 'store/return-app-status.timeline.package-verified', defaultMessage: 'Package verified - {ts, date, medium} {ts, time, short}' },
  amountRefunded: { id: 'store/return-app-status.timeline.refunded', defaultMessage: 'Refunded - {ts, date, medium} {ts, time, short}' },
  denied: { id: 'store/return-app-status.timeline.denied', defaultMessage: 'Denied - {ts, date, medium} {ts, time, short}' },
  cancelled: { id: 'store/return-app-status.timeline.cancelled', defaultMessage: 'Cancelled - {ts, date, medium} {ts, time, short}' },
})

type Comments = RefundStatusComment[]
interface VisitedStatus {
  status: Status
  visited: boolean
  comments?: Comments
  createdAt?: string
  submittedBy?: string | null
}

export const createStatusTimeline = (
  currentStatus: Status,
  refundStatusData: RefundStatusData[]
): VisitedStatus[] => {
  const refundStatusMap = new Map<Status, VisitedStatus>()

  for (const status of refundStatusData ?? []) {
    const { status: statusName, comments, createdAt, submittedBy } = status

    refundStatusMap.set(statusName as Status, {
      status: statusName as Status,
      visited: true,
      comments,
      createdAt,
      submittedBy,
    })
  }

  const statusTimeline: VisitedStatus[] = []

  const isDenied = currentStatus === 'denied'
  const isCancelled = currentStatus === 'cancelled'

  for (const statusName of statusSequence) {
    const status = refundStatusMap.get(statusName)

    if (!status && !isDenied && !isCancelled) {
      statusTimeline.push({ status: statusName, visited: false })
      continue
    }

    if (status) {
      statusTimeline.push(status as VisitedStatus)
    }
  }

  if (isDenied || isCancelled) {
    const status = refundStatusMap.get(isDenied ? 'denied' : 'cancelled')

    if (status) {
      statusTimeline.push(status)
    }
  }

  return statusTimeline
}
