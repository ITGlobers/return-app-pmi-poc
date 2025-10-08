import React from 'react'
import { FormattedMessage } from 'react-intl'
import { NumericStepper, Button } from 'vtex.styleguide'
import { FormattedCurrency } from 'vtex.format-currency'
import { CustomMessage } from '../layout/CustomMessage'
import { ReasonDropdown } from './ReasonDropdown'
// import { useStoreSettings } from '../../../hooks/useStoreSettings'
import styles from './styles.css'

interface Props {
  items: ProductToReturn[]
  errors: string[]
  handleUpdateItemQuantity: (itemId: string, quantity: number) => void
  handleItemReasonChange: (itemId: string, reason: string) => void
  handleItemSelection: (itemId: string) => void
}

export const ItemsList = ({
  items,
  errors,
  handleUpdateItemQuantity,
  handleItemReasonChange,
  handleItemSelection
}: Props) => {

  // const { data: storeSettings } = useStoreSettings()
  // const { options } = storeSettings ?? {}
  // const { enableSelectItemCondition } = options ?? {}

  const noItemSelected = errors.some(
    (error) => error === 'no-item-selected'
  )

  return (
    <div className={`${styles.productsListContainer} w-100`}>
      <div className={styles.productsListWrapper}>
        {items.map(({
          id, name, imageUrl, price, quantityAvailable, reason, isSelected, quantityToReturn,
        }) => (
          <div key={id} className={styles.productItem}>
            <div className={styles.productImage}>
              <img src={imageUrl} alt={name} />
            </div>
            <div className={styles.productName}>
              <h4>{name}</h4>
            </div>
            <div className={styles.productPrice}>
              <FormattedCurrency value={price / 10000} />
            </div>
            <div className={styles.productAvailable}>
              <span>
                <strong>Available to return:</strong> {quantityAvailable}
              </span>
            </div>
            <div className={styles.productQuantity}>
              <NumericStepper
                size="small"
                maxValue={quantityAvailable}
                value={quantityToReturn}
                onChange={(e: { value: number }) => handleUpdateItemQuantity(id, e.value)}
                readOnly={isSelected}
              />
            </div>
            <div className={styles.productReason}>
              <ReasonDropdown
                reason={reason}
                handleItemReasonChange={(newReason) => handleItemReasonChange(id, newReason)}
                isSelected={isSelected}
              />
            </div>
            <div className={styles.productAction}>
              <Button
                variation={isSelected ? 'danger' : 'primary'}
                size="small"
                disabled={quantityToReturn === 0 || !reason}
                onClick={() => handleItemSelection(id)}
              >
                {isSelected ? 'Remove' : 'Add'}
              </Button>
            </div>
          </div>
        ))}
      </div>
      {noItemSelected ? (
        <CustomMessage
          status="error"
          message={
            <FormattedMessage id="store/return-app.return-items-list.no-items-selected.error" />
          }
        />
      ) : null}
    </div>
  )
}
