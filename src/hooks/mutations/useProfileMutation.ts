import { useMutation } from '@tanstack/react-query'
import { updateCredentials } from 'src/lib/api'
import { UpdateCredentialsParams } from 'src/lib/api-types'

type ProfileMutationsArgs = {
  onSuccess?: () => void
  setSubmitting?: (value: React.SetStateAction<boolean>) => void
}

export function useProfileMutation(args: ProfileMutationsArgs) {
  const profileMutation = useMutation({
    mutationFn: async (data: UpdateCredentialsParams) => {
      args.setSubmitting?.(true)

      const params = new URLSearchParams()
      for (const [key, value] of Object.entries(data)) {
        params.append(key, value.toString())
      }

      return await updateCredentials(params)
    },
    onError: (error) => {
      console.error('Error handled by like useMutation:', error)
    },
    onSuccess: () => {
      args.setSubmitting?.(false)
      args.onSuccess?.()
    }
  })

  return { profileMutation }
}
