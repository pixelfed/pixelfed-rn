import { Button, XStack } from 'tamagui'

export default function FollowProfile({ onPress }) {
  return (
    <XStack w="100%" my="$3" gap="$2">
      <Button
        variant="outlined"
        borderColor="black"
        size="$4"
        color="black"
        fontWeight="bold"
        fontSize="$6"
        flexGrow={1}
        onPress={() => onPress()}
      >
        Cancel Follow Request
      </Button>
    </XStack>
  )
}
