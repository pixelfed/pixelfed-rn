import { useMutation } from '@tanstack/react-query'
import { likeStatus, unlikeStatus } from 'src/lib/api'

type onSucessType = Parameters<typeof useMutation>[0]['onSuccess']

export function useLikeMutation({ onSuccess }: { onSuccess?: onSucessType } = {}) {
  const likeMutation = useMutation({
    mutationFn: async (handleLike) => {
      try {
        return handleLike.type === 'like'
          ? await likeStatus(handleLike)
          : await unlikeStatus(handleLike)
      } catch (error) {
        console.error('Error within mutationFn:', error)
        throw error // the thrown error is not handled? the count is still updated / not reverted in ui
      }
    },
    onError: (error) => {
      console.error('Error handled by like useMutation:', error)
    },
    onSuccess,
  })

  const handleLike = async (id: string, state: boolean) => {
    try {
      likeMutation.mutate({ type: state ? 'unlike' : 'like', id: id })
    } catch (error) {
      console.error('Error occurred during like:', error)
    }
  }

  return { handleLike }
}
