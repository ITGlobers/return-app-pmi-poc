import type { ChangeEvent } from 'react'
import React from 'react'
import { useIntl } from 'react-intl'
import { Dropdown } from 'vtex.styleguide'
import { getReasonOptions } from '../../../../common/constants/returnsRequest'
import { defaultReturnReasonsMessages } from '../../../utils/defaultReturnReasonsMessages'

interface Props {
  reason: string
  handleItemReasonChange: (reason: string) => void
  isSelected: boolean
}

export const ReasonDropdown = ({ reason, handleItemReasonChange, isSelected }: Props) => {
  const { formatMessage } = useIntl()

  const reasonOptions: Array<{ value: string; label: string }> = getReasonOptions(formatMessage)

  return (
    <Dropdown
      placeholder={formatMessage(
        defaultReturnReasonsMessages.reasonSelectReason
      )}
      size="small"
      options={reasonOptions}
      value={reason}
      onChange={(e: ChangeEvent<HTMLInputElement>) =>
        handleItemReasonChange(e.target.value)
      }
      disabled={isSelected}
    />
  )
}
