import { Feather } from '@expo/vector-icons'
import { Text, useTheme, YStack } from 'tamagui'

export default function ErrorFeed() {
  const theme = useTheme()

  return (
    <YStack m="$6" justifyContent="center" alignItems="center" gap="$3">
      <Feather name="alert-circle" size={80} color="red" />
      <Text fontSize="$9" color={theme.color?.val.default.val}>
        Oops!
      </Text>
      <Text textAlign="center" fontSize="$7" color={theme.color?.val.default.val}>
        The service may be temporarily unavailable, please try again later.
      </Text>
      <Text textAlign="center" fontSize="$5" color={theme.color?.val.default.val}>
        If this problem persists, please contact support.
      </Text>
    </YStack>
  )
}
