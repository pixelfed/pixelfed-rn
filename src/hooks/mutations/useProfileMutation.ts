import { useToastController } from '@tamagui/toast'
import { useMutation } from '@tanstack/react-query'
import { updateCredentials } from 'src/lib/api'
import { UpdateCredentialsParams } from 'src/lib/api-types'

type ProfileMutationArgs = {
  onSuccess?: () => void
  onError?: (error: Error) => void
  setSubmitting?: (value: React.SetStateAction<boolean>) => void
}

export function useProfileMutation(args: ProfileMutationArgs) {
  const toast = useToastController()

  const profileMutation = useMutation({
    mutationFn: async (data: Partial<UpdateCredentialsParams>) => {
      args.setSubmitting?.(true)

      const params = new URLSearchParams()
      for (const [key, value] of Object.entries(data)) {
        params.append(key, value.toString())
      }

      return await updateCredentials(params)
    },
    onError: (error) => {
      if (!!args.onError) {
        return args.onError?.(error)
      }

      args.setSubmitting?.(false)

      toast.show('Failed to save changes', {
        message: 'Please try again later',
        native: false
      })
      console.error('Error handled by like useMutation:', error)
    },
    onSuccess: () => {
      args.setSubmitting?.(false)
      args.onSuccess?.()
    }
  })

  return { profileMutation }
}
