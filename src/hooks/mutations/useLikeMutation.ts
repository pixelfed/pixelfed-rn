import { useMutation, useQueryClient } from '@tanstack/react-query'
import { likeStatus, unlikeStatus } from 'src/lib/api'
import { Status } from 'src/lib/api-types'

type onSuccessType = Parameters<typeof useMutation>[0]['onSuccess']
type LikeMutateType = {
  type: 'like' | 'unlike'
  id: string
}


export function useLikeMutation({ onSuccess }: { onSuccess?: onSuccessType } = {}) {
  const queryClient = useQueryClient();

  // By default, after a like/unlike I'm updating the state with the new info I received from backend
  const defaultOnSuccess: onSuccessType = (data: Status, variables) => {
    queryClient.setQueryData(['getStatusById', data.id], data)
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (handleLike: LikeMutateType) => {
      try {
        const res = handleLike.type === 'like'
          ? await likeStatus(handleLike)
          : await unlikeStatus(handleLike);
        return res;
      } catch (error) {
        console.error('Error within mutationFn:', error)
        throw error // the thrown error is not handled? the count is still updated / not reverted in ui
      }
    },
    onError: (error) => {
      console.error('Error handled by like useMutation:', error)
    },
    onSuccess: onSuccess || defaultOnSuccess
  })

  /**
   * handler function for 'like' mutations that occur when a post is
   * liked or unliked
   *
   * @param id string id of the post that has been liked/unliked
   * @param liked value of the posts like status, true = 'like', false = 'unlike'
   */
  async function handleLike(id: string, liked: boolean) {
    try {
      mutate({ type: liked ? 'like' : 'unlike', id: id })
    } catch (error) {
      console.error('Error occurred during like:', error)
    }
  }

  return { handleLike, isLikePending: isPending }
}
