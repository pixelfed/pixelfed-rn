import { useMutation, useQueryClient } from '@tanstack/react-query'
import { likeStatus, unlikeStatus } from 'src/lib/api'
import type { Status } from 'src/lib/api-types'

type onSuccessType = Parameters<typeof useMutation>[0]['onSuccess']
type LikeMutateType = {
  type: 'like' | 'unlike'
  id: string
}

export function useLikeMutation({ onSuccess }: { onSuccess?: onSuccessType } = {}) {
  const queryClient = useQueryClient()

  const updateStatusInCache = (status: Status, isLike: boolean) => {
    const newStatus = {
      ...status,
      favourited: isLike,
      // Don't modify count if the favourited state hasn't changed
      favourites_count:
        status.favourited === isLike
          ? status.favourites_count
          : isLike
            ? (status.favourites_count ?? 0) + 1
            : Math.max(0, (status.favourites_count ?? 1) - 1),
    }

    return newStatus
  }

  const updateFeedData = (old: any, statusId: string, isLike: boolean) => {
    if (!old?.pages) return old
    return {
      ...old,
      pages: old.pages.map((page: any) => ({
        ...page,
        data: Array.isArray(page.data)
          ? page.data.map((status: Status) =>
              status.id === statusId ? updateStatusInCache(status, isLike) : status
            )
          : page.data,
      })),
    }
  }

  const { mutate, isPending } = useMutation({
    mutationFn: async (handleLike: LikeMutateType) => {
      const res =
        handleLike.type === 'like'
          ? await likeStatus(handleLike)
          : await unlikeStatus(handleLike)

      return res
    },

    onMutate: async (newLike: LikeMutateType) => {
      // Cancel outgoing refetches
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['homeFeed'] }),
        queryClient.cancelQueries({ queryKey: ['fetchNetworkFeed'] }),
        queryClient.cancelQueries({ queryKey: ['getStatusById', newLike.id] }),
      ])

      // Snapshot previous state
      const previousState = {
        homeFeed: queryClient.getQueryData(['homeFeed']),
        networkFeed: queryClient.getQueryData(['fetchNetworkFeed']),
        status: queryClient.getQueryData(['getStatusById', newLike.id]),
      }

      const isLike = newLike.type === 'like'

      // Optimistic updates
      queryClient.setQueriesData({ queryKey: ['homeFeed'] }, (old: any) =>
        updateFeedData(old, newLike.id, isLike)
      )

      queryClient.setQueriesData({ queryKey: ['fetchNetworkFeed'] }, (old: any) =>
        updateFeedData(old, newLike.id, isLike)
      )

      queryClient.setQueryData(
        ['getStatusById', newLike.id],
        (oldStatus: Status | undefined) =>
          oldStatus ? updateStatusInCache(oldStatus, isLike) : oldStatus
      )

      return previousState
    },

    onSuccess: (data, variables) => {
      // Simply use the server response data directly
      const queries = [['homeFeed'], ['fetchNetworkFeed']]

      queries.forEach((queryKey) => {
        queryClient.setQueriesData({ queryKey }, (old: any) => {
          if (!old?.pages) return old
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: Array.isArray(page.data)
                ? page.data.map((status: Status) =>
                    status.id === data.id ? data : status
                  )
                : page.data,
            })),
          }
        })
      })

      // Update individual status
      queryClient.setQueryData(['getStatusById', data.id], data)
    },

    onError: (err, variables, context) => {
      if (context) {
        queryClient.setQueryData(['homeFeed'], context.homeFeed)
        queryClient.setQueryData(['fetchNetworkFeed'], context.networkFeed)
        queryClient.setQueryData(['getStatusById', variables.id], context.status)
      }
    },
  })

  const handleLike = async (id: string, liked: boolean) => {
    try {
      await mutate({ type: liked ? 'like' : 'unlike', id })
    } catch (error) {
      console.error('Error in handleLike:', error)
    }
  }

  return { handleLike, isLikePending: isPending }
}
