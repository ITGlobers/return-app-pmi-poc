import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { Table, EmptyState, Spinner } from 'vtex.styleguide'
import { useCssHandles } from 'vtex.css-handles'
import { useRuntime } from 'vtex.render-runtime'
import type { ReturnRequestResponse } from 'baranda.return-app-pmi'

import ReturnListSchema from './ListTableSchema'
import JumpToPage from './JumpToPage'
import ListTableFilter from './ListTableFilter'
import MobileList from './MobileList'
import { useReturnRequestList } from '../../../hooks/useReturnRequestList'

const CSS_HANDLES = [
  'listTableContainer',
  'loadingDataSpinnerContainer',
] as const

const messages = defineMessages({
  errorTitle: {
    id: 'store/return-app.return-request-list.error.title',
    defaultMessage: 'Error loading list',
  },
  errorDescription: {
    id: 'store/return-app.return-request-list.error.description',
    defaultMessage: 'An error occurred while loading the request list. Please try again.',
  },
  emptyState: {
    id: 'store/return-app.return-request-list.table.emptyState',
    defaultMessage: 'No results available',
  },
  emptyStateChildren: {
    id: 'store/return-app.return-request-list.table.emptyState-children',
    defaultMessage: 'Try different filters for your search',
  },
  textOf: {
    id: 'store/return-app.return-request-list.table-pagination.textOf',
    defaultMessage: 'of',
  },
})

const ListTable = () => {
  const intl = useIntl()
  const [mobileOrdersList, setMobileOrdersList] = useState<
    ReturnRequestResponse[]
  >([])

  const {
    returnRequestData: { data, loading, error, refetch },
  } = useReturnRequestList()

  const {
    route: { domain },
    hints: { mobile, phone },
  } = useRuntime()

  const isAdmin = domain === 'admin'

  const handles = useCssHandles(CSS_HANDLES)

  const { returnRequestList } = data ?? {}
  const { list, paging } = returnRequestList ?? {}

  let pageItemFrom = 0
  let pageItemTo = 0

  if (paging && list?.length) {
    const { currentPage, total, perPage, pages } = paging

    pageItemFrom = currentPage === 1 ? 1 : (currentPage - 1) * perPage + 1
    pageItemTo = currentPage === pages ? total : currentPage * perPage
  }

  const handleNextPage = () => {
    if (!paging) return

    const { currentPage, pages } = paging

    if (currentPage === pages) return

    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    refetch({ page: currentPage + 1 })
  }

  const handlePrevPage = () => {
    if (!paging) return

    const { currentPage } = paging

    if (currentPage === 1) return

    refetch({ page: currentPage - 1 })
  }

  const handleJumpToPage = (desiredPage: number) => {
    desiredPage && refetch({ page: desiredPage })
  }

  const returnsListSchema = useMemo(() => ReturnListSchema(), [])

  const fetchMoreItems = useCallback(async () => {
    const currentPage = paging?.currentPage ?? 1
    const maxPage = paging?.pages ?? 1

    if (currentPage < maxPage) {
      await refetch({ page: currentPage + 1 })
    }
  }, [paging?.currentPage, paging?.pages, refetch])

  const handleScroll = useCallback(async () => {
    const { scrollHeight } = document.documentElement
    const { scrollTop } = document.documentElement
    const { clientHeight } = document.documentElement

    const userReachedEndOfPage = scrollTop + clientHeight === scrollHeight

    if (!userReachedEndOfPage) return

    try {
      await fetchMoreItems()
    } catch (err) {
      console.error('Error while fetching more items', err)
    }
  }, [fetchMoreItems])

  const verifyIfItemAlreadyExists = (
    array: ReturnRequestResponse[],
    item: ReturnRequestResponse | null | undefined
  ) => {
    if (!item) return false

    return (
      array.findIndex((arrayItem) => arrayItem?.orderId === item?.orderId) !==
      -1
    )
  }

  useEffect(() => {
    if (list) {
      setMobileOrdersList((current) => {
        const alreadyExist = verifyIfItemAlreadyExists(current, list[0])

        if (alreadyExist) return current

        return [...current, ...list]
      })
    }
  }, [list])

  useEffect(() => {
    if (!phone) return

    if (window) {
      window.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (window) {
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }, [phone, handleScroll])

  if (error) {
    return (
      <EmptyState title={intl.formatMessage(messages.errorTitle)}>
        {intl.formatMessage(messages.errorDescription)}
      </EmptyState>
    )
  }

  return (
    <div className={handles.listTableContainer}>
      {mobile && !isAdmin ? null : (
        <ListTableFilter
          refetch={refetch}
          loading={loading}
          isDisabled={!list?.length}
        />
      )}

      {phone ? (
        <>
          <MobileList items={mobileOrdersList ?? []} />
          {loading && list?.length ? (
            <div
              className={`flex justify-center items-center mt6 mb6 ${handles.loadingDataSpinnerContainer}`}
            >
              <Spinner size={20} color="#dedede" />
            </div>
          ) : null}
        </>
      ) : (
        <Table
          fullWidth
          loading={loading}
          items={list}
          emptyStateLabel={intl.formatMessage(messages.emptyState)}
          emptyStateChildren={
            <p>{intl.formatMessage(messages.emptyStateChildren)}</p>
          }
          schema={returnsListSchema}
          pagination={{
            textOf: intl.formatMessage(messages.textOf),
            onNextClick: handleNextPage,
            onPrevClick: handlePrevPage,
            currentItemFrom: pageItemFrom,
            currentItemTo: pageItemTo,
            totalItems: paging?.total,
          }}
        />
      )}
      {!phone && paging && list?.length && !loading ? (
        <JumpToPage
          handleJumpToPage={handleJumpToPage}
          currentPage={paging.currentPage}
          maxPage={paging.pages}
        />
      ) : null}
    </div>
  )
}

export default ListTable
