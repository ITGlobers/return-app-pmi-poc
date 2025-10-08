/* eslint-disable no-console */
import React from 'react'
import type { FormEvent, ReactElement } from 'react'
import { utils, Button, EXPERIMENTAL_Modal as Modal } from 'vtex.styleguide'
import { useRuntime } from 'vtex.render-runtime'
import { defineMessages, FormattedMessage, useIntl } from 'react-intl'

import { useReturnDetails } from '../../hooks/useReturnDetails'
import { useUpdateRequestStatus } from '../../../admin/hooks/useUpdateRequestStatus'

type CancellationMessage =
  | 'adminAllow'
  | 'adminRefuse'
  | 'storeAllow'
  | 'storeRefuse'

export const messages = defineMessages({
  adminAllow: {
    id: 'store/return-app.return-request-details.cancellation.modal.adminAllow',
    defaultMessage:
      '<p>Attention: This request\'s status will be set to CANCELLED.</p><p>This will notify the user via email and allow them to create a new return request with the cancelled request\'s items.</p><p>If that is not your intention, set the request as DENIED.</p>',
  },
  adminRefuse: {
    id: 'store/return-app.return-request-details.cancellation.modal.adminRefuse',
    defaultMessage:
      '<p>Sorry, it\'s not possible to cancel this request due to its current status.</p>',
  },
  storeAllow: {
    id: 'store/return-app.return-request-details.cancellation.modal.storeAllow',
    defaultMessage:
      '<p>Cancelling this request will allow the current items to be used in a new return request.</p><p>This action is irreversible.</p>',
  },
  storeRefuse: {
    id: 'store/return-app.return-request-details.cancellation.modal.storeRefuse',
    defaultMessage:
      '<p>Sorry, you need to contact the support team to cancel this request due to its current status.</p>',
  },
})

const ParagraphChunk = (chunks: ReactElement) => <p>{chunks}</p>

const RequestCancellation = () => {
  const { isOpen, onOpen, onClose } = utils.useDisclosure()
  const { data } = useReturnDetails()
  const {
    route: { domain },
    hints: { phone },
  } = useRuntime()

  const { formatMessage } = useIntl()

  const { submitting, handleStatusUpdate } = useUpdateRequestStatus()

  if (!data) return null

  const { status, id } = data.returnRequestDetails

  const isDisabled = ['denied', 'cancelled'].includes(status)

  if (isDisabled) {
    return (
      <Button variation="danger" size="small" disabled>
        <FormattedMessage
          id="store/return-app.return-request-details.cancellation.cta"
          defaultMessage="Cancel request"
        />
      </Button>
    )
  }

  const isAdmin = domain === 'admin'

  // Both the user and the admin have different rules and messages
  let messageKey: CancellationMessage

  if (isAdmin) {
    messageKey =
      status === 'new' || status === 'processing' ? 'adminAllow' : 'adminRefuse'
  } else {
    messageKey = status === 'new' ? 'storeAllow' : 'storeRefuse'
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) {
      return
    }

    handleStatusUpdate({
      id,
      status: 'cancelled',
      cleanUp: () => {
        onClose()
      },
    })
  }

  return (
    <>
      <div className={phone ? 'mt4' : ''}>
        <Button
          variation="danger"
          size="small"
          onClick={onOpen}
          disabled={isDisabled}
        >
          <FormattedMessage
            id="store/return-app.return-request-details.cancellation.cta"
            defaultMessage="Cancel request"
          />
        </Button>
      </div>

      <Modal
        size="small"
        isOpen={isOpen}
        onClose={onClose}
        bottomBar={
          <div className="nowrap">
            <span className="mr4">
              <Button
                size="small"
                variation="tertiary"
                onClick={onClose}
                disabled={submitting}
              >
                <FormattedMessage
                  id="store/return-app.return-request-details.cancellation.modal.close"
                  defaultMessage="Close"
                />
              </Button>
            </span>
            <span>
              <Button
                size="small"
                disabled={['adminRefuse', 'storeRefuse'].includes(messageKey)}
                variation="danger"
                onClick={handleSubmit}
                isLoading={submitting}
              >
                <FormattedMessage
                  id="store/return-app.return-request-details.cancellation.modal.accept"
                  defaultMessage="Proceed to cancel"
                />
              </Button>
            </span>
          </div>
        }
      >
        <div>
          {formatMessage(messages[messageKey], {
            p: ParagraphChunk,
          })}
        </div>
      </Modal>
    </>
  )
}

export default RequestCancellation
