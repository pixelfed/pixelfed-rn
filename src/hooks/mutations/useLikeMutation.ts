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

  const updateStatus = (status: Status, isLike: boolean) => {
    if (!status || status.favourited === isLike) return status
    
    return {
      ...status,
      favourited: isLike,
      favourites_count: isLike 
        ? (status.favourites_count ?? 0) + 1 
        : Math.max(0, (status.favourites_count ?? 1) - 1)
    }
  }

  const updateFeed = (old: any, statusId: string, isLike: boolean) => {
    if (!old?.pages) return old
    
    let updated = false
    const newPages = old.pages.map((page: any) => {
      if (!Array.isArray(page.data)) return page
      
      let pageUpdated = false
      const newData = page.data.map((status: Status) => {
        if (status.id !== statusId) return status
        if (status.favourited === isLike) return status
        
        pageUpdated = true
        return updateStatus(status, isLike)
      })
      
      if (!pageUpdated) return page
      updated = true
      return { ...page, data: newData }
    })
    
    return updated ? { ...old, pages: newPages } : old
  }

  const { mutate, isPending } = useMutation({
    mutationFn: async (handleLike: LikeMutateType) => {
      return handleLike.type === 'like'
        ? await likeStatus(handleLike)
        : await unlikeStatus(handleLike)
    },

    onMutate: async (newLike: LikeMutateType) => {
      const queryKeys = [
        ['homeFeed'],
        ['fetchNetworkFeed'],
        ['getStatusById', newLike.id]
      ]
      
      // Cancel queries in parallel
      await Promise.all(
        queryKeys.map(key => queryClient.cancelQueries({ queryKey: key }))
      )

      const isLike = newLike.type === 'like'
      const previousState: Record<string, any> = {}

      // Snapshot and update in a single pass
      queryKeys.forEach(key => {
        const queryKey = key.join('/')
        const currentData = queryClient.getQueryData(key)
        previousState[queryKey] = currentData

        if (key.length === 1) {
          // Feed update
          const updatedFeed = updateFeed(currentData, newLike.id, isLike)
          if (updatedFeed !== currentData) {
            queryClient.setQueryData(key, updatedFeed)
          }
        } else {
          // Individual status update
          const updatedStatus = updateStatus(currentData, isLike)
          if (updatedStatus !== currentData) {
            queryClient.setQueryData(key, updatedStatus)
          }
        }
      })

      return previousState
    },

    onError: (err, variables, context) => {
      if (!context) return

      Object.entries(context).forEach(([key, value]) => {
        const queryKey = key.split('/')
        queryClient.setQueryData(queryKey, value)
      })
    },

    onSuccess: (data, variables) => {
      // Update all instances of this status with server data
      const queryKeys = [
        ['homeFeed'],
        ['fetchNetworkFeed'],
        ['getStatusById', variables.id]
      ]

      queryKeys.forEach(key => {
        if (key.length === 1) {
          queryClient.setQueriesData({ queryKey: key }, old => {
            if (!old?.pages) return old
            return updateFeed(old, data.id, data.favourited)
          })
        } else {
          queryClient.setQueryData(key, data)
        }
      })

      if (onSuccess) {
        onSuccess(data, variables)
      }
    }
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