import { Feather } from '@expo/vector-icons'
import { Text, YStack } from 'tamagui'

export default function ErrorFeed() {
  return (
    <YStack my="$6" justifyContent="center" alignItems="center" gap="$3">
      <Feather name="alert-circle" size={80} color="red" />
      <Text fontSize="$9">No posts found!</Text>
      <Text fontSize="$7">The service may be temporarily unavailable.</Text>
      <Text fontSize="$5">Pull to refresh</Text>
    </YStack>
  )
}
