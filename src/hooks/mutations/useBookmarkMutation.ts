import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postBookmark, postUnBookmark } from 'src/lib/api'
import type { Status } from 'src/lib/api-types'

type onSuccessType = Parameters<typeof useMutation>[0]['onSuccess']
type bookmarkMutateType = {
  type: boolean
  id: string
}

export function useBookmarkMutation({ onSuccess }: { onSuccess?: onSuccessType } = {}) {
  const queryClient = useQueryClient()

  const updateAPICache = (id: string, isBookmarked: boolean) => {
    const queryKeys = [
      ['homeFeed'],
      ['getSelfBookmarks'],
      ['fetchNetworkFeed'],
      ['getStatusById', id],
    ]

    queryKeys.forEach((key) => {
      if (key.length === 1) {
        queryClient.setQueriesData({ queryKey: key }, (old) => {
          if (!old?.pages) return old

          const newPages = old.pages.map((page) => {
            const newData = page.data.map((post: Status) => {
              if (post.id !== id) return post
              return {
                ...post,
                bookmarked: isBookmarked,
              }
            })
            return { ...page, data: newData }
          })

          return { ...old, pages: newPages }
        })
      } else {
        queryClient.setQueryData(key, (oldData: any) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            bookmarked: isBookmarked,
          }
        })
      }
    })
  }

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ id, type }: bookmarkMutateType) => {
      return type ? await postBookmark(id) : await postUnBookmark(id)
    },

    onMutate: async ({ id, type }) => {
      const queryKeys = [
        ['homeFeed'],
        ['getSelfBookmarks'],
        ['fetchNetworkFeed'],
        ['getStatusById'],
      ]

      const previousState: Record<string, any> = {}

      await Promise.all(
        queryKeys.map((key) => queryClient.cancelQueries({ queryKey: key }))
      )

      queryKeys.forEach((key) => {
        const queryKey = key.join('/')
        const currentData = queryClient.getQueryData(key)
        previousState[queryKey] = currentData
      })

      updateAPICache(id, type)

      return previousState
    },

    onError: (_err, { id }, context) => {
      if (!context) return

      Object.entries(context).forEach(([key, value]) => {
        const queryKey = key.split('/')
        queryClient.setQueryData(queryKey, value)
      })
    },
  })

  const handleBookmark = async (id: string, isBookmarked: boolean) => {
    try {
      await mutate({ id, type: isBookmarked })
    } catch (_err) {}
  }

  return { handleBookmark, isBookmarkPending: isPending }
}
