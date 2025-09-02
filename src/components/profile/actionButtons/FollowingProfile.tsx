import { Alert } from 'react-native'
import { Button, useTheme, XStack } from 'tamagui'

export default function FollowingProfile({
  onPress,
  onSendMessage,
}: {
  onPress: () => void
  onSendMessage: () => void
}) {
  const theme = useTheme()
  const handleAction = () => {
    Alert.alert('Confirm Unfollow', 'Are you sure you want to unfollow this account?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Unfollow',
        style: 'destructive',
        onPress: () => onPress(),
      },
    ])
  }
  return (
    <XStack w="100%" my="$3" gap="$2">
      <Button
        accessible={true}
        accessibilityLabel="Unfollow"
        accessibilityRole="button"
        theme="light"
        size="$3"
        bg="transparent"
        color={theme.color?.val.default.val}
        borderWidth={1}
        borderColor={theme.borderColor?.val.default.val}
        fontWeight="bold"
        fontSize="$4"
        flexGrow={1}
        onPress={() => handleAction()}
      >
        Unfollow
      </Button>

      <Button
        accessible={true}
        accessibilityLabel="Send message"
        accessibilityRole="button"
        theme="light"
        bg="transparent"
        size="$3"
        borderWidth={1}
        borderColor={theme.borderColor?.val.default.val}
        color={theme.color?.val.default.val}
        fontWeight="bold"
        fontSize="$4"
        onPress={() => onSendMessage()}
      >
        Send Message
      </Button>
    </XStack>
  )
}
