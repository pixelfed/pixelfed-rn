import { useToastController } from '@tamagui/toast'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { updateCredentials } from 'src/lib/api'
import type { UpdateCredentialsParams } from 'src/lib/api-types'

type ProfileMutationArgs = {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useProfileMutation(args: ProfileMutationArgs) {
  const toast = useToastController()
  const [isSubmitting, setSubmitting] = useState(false)

  const profileMutation = useMutation({
    mutationFn: async (data: Partial<UpdateCredentialsParams>) => {
      setSubmitting(true)

      const params = new URLSearchParams()
      for (const [key, value] of Object.entries(data)) {
        params.append(key, value.toString())
      }

      return await updateCredentials(params)
    },
    onError: (error) => {
      if (args.onError) {
        return args.onError?.(error)
      }

      setSubmitting(false)

      toast.show('Failed to save changes', {
        message: 'Please try again later',
        native: false,
      })
    },
    onSuccess: () => {
      setSubmitting(false)
      args.onSuccess?.()
    },
  })

  return { profileMutation, isSubmitting }
}
