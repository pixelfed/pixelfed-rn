import { Link } from 'expo-router'
import { Alert } from 'react-native'
import { Button, XStack } from 'tamagui'

export default function FollowingProfile({ onPress, onSendMessage }) {
  const handleAction = () => {
    Alert.alert(
      'Confirm Unfollow',
      'Are you sure you want to unfollow this account?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Unfollow',
          style: 'destructive',
          onPress: () => onPress()
        }
      ]
    )
  }
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
        onPress={() => handleAction()}
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
