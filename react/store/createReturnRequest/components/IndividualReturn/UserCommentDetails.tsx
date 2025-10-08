import React from 'react'
import type { ChangeEvent } from 'react'
import { FormattedMessage } from 'react-intl'
import { Textarea } from 'vtex.styleguide'

interface Props {
  userComment: string
  handleCommentChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
}

export const UserCommentDetails = ({ userComment, handleCommentChange }: Props) => {
  return (
    <div className={`mt4 ph4`}>
      <p>
        <FormattedMessage id="store/return-app.return-order-details.title.extra-comment" />
      </p>
      <div>
        <Textarea
          name="extraComment"
          resize="none"
          onChange={handleCommentChange}
          maxLength="300"
          value={userComment ?? ''}
        />
      </div>
    </div>
  )
}
