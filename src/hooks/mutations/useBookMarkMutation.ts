import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { postBookmark, postUnBookmark } from 'src/lib/api'
import type { Status } from 'src/lib/api-types'

type onSuccessType = Parameters<typeof useMutation>[0]['onSuccess']
type bookMarkMutateType = {
  type: boolean
  id: string
}

export function useBookMarkMutation({ onSuccess }: { onSuccess?: onSuccessType } = {}) {
  const queryClient = useQueryClient()

  const updateFeedCache = (id: string, isBookMarked: boolean) => {
    queryClient.setQueriesData({ queryKey: ['homeFeed'] }, (old: any) => {
      if (!old?.pages) return old

      const newPages = old.pages.map((page) => {
        const newData = page.data.map((post: Status) => {
          if (post.id !== id) return post
          return {
            ...post,
            bookmarked: isBookMarked
          }
        })
        return { ...page, data: newData }
      })
      
      return { ...old, pages: newPages } ;
    })

    queryClient.setQueriesData({ queryKey: ['getSelfBookmarks'] }, (old: any) => {
        if (!old?.pages) return old
        const newPages = old.pages.map((page) => {
          const newData = page.data.map((post: Status) => {
            if (post.id !== id) return post
            return {
              ...post,
              bookmarked: isBookMarked
            }
          })
          return { ...page, data: newData }
        })
        return { ...old, pages: newPages };
      })

      queryClient.setQueryData(['fetchNetworkFeed'], (oldData:any) => {
        if (!oldData) return oldData

        const newPages = oldData.pages.map((page) => {
            const newData = page.data.map((post: Status) => {
              if (post.id !== id) return post
              return {
                ...post,
                bookmarked: isBookMarked
              }
            })
            return { ...page, data: newData }
          })

        return { ...oldData, pages: newPages }
      })
    
      queryClient.setQueryData(['getStatusById', id ], (oldData:any) => {
        if (!oldData) return oldData
        return {
            ...oldData,
            bookmarked: isBookMarked
          }
      })
  }

  const {mutate, isPending } =  useMutation({
    mutationFn: async ({ id, type }: bookMarkMutateType) => {
      return type ? await postBookmark( id ) : await postUnBookmark(id);
    },

    onMutate: async ({ id, type }) => {
      await queryClient.cancelQueries({ queryKey: ['homeFeed'] })
      const previousDataHomeFeed = queryClient.getQueryData(['homeFeed'])
      await queryClient.cancelQueries({ queryKey: ['getSelfBookmarks'] })
      const previousDataSelfBookMarkFeed = queryClient.getQueryData(['getSelfBookmarks'])
      await queryClient.cancelQueries({ queryKey: ['getStatusById'] })
      const previousDataPost = queryClient.getQueryData(['getStatusById'])
      await queryClient.cancelQueries({ queryKey: ['fetchNetworkFeed'] })
      const previousDataNetworkFeed = queryClient.getQueryData(['fetchNetworkFeed'])
      updateFeedCache(id, type)
      return { previousDataHomeFeed, previousDataSelfBookMarkFeed ,previousDataPost, previousDataNetworkFeed }
    },

    onError: (err, { id }, context) => {
      if (context?.previousDataHomeFeed) {
        queryClient.setQueryData(['homeFeed'], context.previousDataHomeFeed)
      }
      if (context?.previousDataSelfBookMarkFeed) {
        queryClient.setQueryData(['getSelfBookmarks'], context.previousDataSelfBookMarkFeed)
      }
      if (context?.previousDataPost) {
        queryClient.setQueryData(['getStatusById'], context.previousDataPost)
      }
      if (context?.previousDataNetworkFeed) {
        queryClient.setQueryData(['fetchNetworkFeed'], context.previousDataNetworkFeed)
      }
    },
  })

  const handleBookMark = useCallback(
    (id: string, isBookmarked: boolean) => {
        mutate({ id, type: isBookmarked})
    },
    [mutate]
  )

  return { handleBookMark , isBookMarkPending: isPending }
}
