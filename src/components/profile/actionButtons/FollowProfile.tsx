import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { followAccountById, unfollowAccountById } from 'src/lib/api'
import { Button, Spinner, XStack } from 'tamagui'

export default function FollowProfile({
  onPress,
  userId,
  isLocked,
}: {
  onPress: () => Promise<void> | void
  userId: () => String
  isLocked: () => Boolean
}) {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)

  const followMutation = useMutation({
    mutationFn: () => {
      return followAccountById(userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getAccountRelationship'] })
      queryClient.invalidateQueries({ queryKey: ['getAccountById'] })
      queryClient.invalidateQueries({ queryKey: ['getAccountByUsername'] })
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['getAccountRelationship'] })
        setIsLoading(false)
      }, 1000)
    },
  })

  const handlePress = async () => {
    setIsLoading(true)

    try {
      await followMutation.mutate()
    } catch (error) {
      console.error('Error following profile:', error)
    }
  }

  const buttonText = isLocked ? 'Request Follow' : 'Follow'

  return (
    <XStack w="100%" my="$3" gap="$2">
      <Button
        theme="light"
        bg="$blue9"
        size="$4"
        color="white"
        fontWeight="bold"
        fontSize="$6"
        flexGrow={1}
        disabled={isLoading}
        icon={isLoading ? () => <Spinner color="white" /> : undefined}
        onPress={handlePress}
      >
        {isLoading ? '' : buttonText}
      </Button>
    </XStack>
  )
}
