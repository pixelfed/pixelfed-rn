import { Link } from 'expo-router'
import { Button, XStack } from 'tamagui'

export default function FollowingProfile() {
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
      >
        Send Message
      </Button>
    </XStack>
  )
}
