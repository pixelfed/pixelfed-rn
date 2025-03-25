import { Feather } from '@expo/vector-icons'
import { Text, View, XStack, YStack } from 'tamagui'
export const ErrorAlert = ({
  message,
  title,
}: {
  message: string
  title: string
}) => {
  return (
    <View>
      <XStack my="$3" justifyContent="flex-start" alignItems="center" gap="$3">
        <Feather name="alert-circle" size={20} color="red" />
        <YStack flex={1}>
          <Text fontSize="$5">{title}</Text>
          <Text fontSize="$3">{message}</Text>
        </YStack>
      </XStack>
    </View>
  )
}
