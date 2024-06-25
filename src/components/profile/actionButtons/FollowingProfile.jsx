import { Link } from 'expo-router'
import { Button, XStack } from 'tamagui'

export default function FollowingProfile({ onPress, onSendMessage }) {
  return (
    <XStack w="100%" my="$3" gap="$2">
      <Button
        theme="light"
        size="$3"
        bg="transparent"
        color="black"
        borderWidth={1}
        borderColor="black"
        fontWeight="bold"
        fontSize="$4"
        flexGrow={1}
        onPress={() => onPress()}
      >
        Unfollow
      </Button>

      <Button
        theme="light"
        bg="transparent"
        size="$3"
        borderWidth={1}
        borderColor="black"
        color="black"
        fontWeight="bold"
        fontSize="$4"
        onPress={() => onSendMessage()}
      >
        Send Message
      </Button>
    </XStack>
  )
}
