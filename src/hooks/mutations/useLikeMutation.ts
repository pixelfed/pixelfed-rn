import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { likeStatus, unlikeStatus } from 'src/lib/api'
import type { Status } from 'src/lib/api-types'

type onSuccessType = Parameters<typeof useMutation>[0]['onSuccess']
type LikeMutateType = {
  type: 'like' | 'unlike'
  id: string
}

export function useLikeMutation({ onSuccess }: { onSuccess?: onSuccessType } = {}) {
  const queryClient = useQueryClient()

  const updateFeedCache = (id: string, isLike: boolean) => {
    queryClient.setQueriesData({ queryKey: ['homeFeed'] }, (old: any) => {
      if (!old?.pages) return old
      let found = false
      const newPages = old.pages.map((page) => {
        const newData = page.data.map((post: Status) => {
          if (post.id !== id) return post
          found = true
          return {
            ...post,
            favourited: isLike,
            favourites_count: isLike
              ? post.favourites_count + 1
              : post.favourites_count - 1,
          }
        })
        return { ...page, data: newData }
      })
      return found ? { ...old, pages: newPages } : old
    })
  }

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ id, type }: LikeMutateType) => {
      return type === 'like' ? await likeStatus({ id }) : await unlikeStatus({ id })
    },

    onMutate: async ({ id, type }) => {
      await queryClient.cancelQueries({ queryKey: ['homeFeed'] })
      const previousData = queryClient.getQueryData(['homeFeed'])
      updateFeedCache(id, type === 'like')
      return { previousData }
    },

    onError: (err, { id }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['homeFeed'], context.previousData)
      }
    },

    onSuccess: (data) => {
      // Use server data to ensure consistency
      queryClient.setQueriesData({ queryKey: ['homeFeed'] }, (old: any) => {
        if (!old?.pages) return old
        const newPages = old.pages.map((page) => ({
          ...page,
          data: page.data.map((post: Status) => (post.id === data.id ? data : post)),
        }))
        return { ...old, pages: newPages }
      })
    },
  })

  const handleLike = useCallback(
    (id: string, liked: boolean) => {
      mutate({ id, type: liked ? 'like' : 'unlike' })
    },
    [mutate]
  )

  return { handleLike, isLikePending: isPending }
}
