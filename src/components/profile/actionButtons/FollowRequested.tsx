import { Button, useTheme, XStack } from 'tamagui'

export default function FollowProfile({ onPress }: { onPress: () => void }) {
  const theme = useTheme()
  return (
    <XStack w="100%" my="$3" gap="$2">
      <Button
        variant="outlined"
        borderColor={theme.color?.val.default.val}
        size="$4"
        color={theme.color?.val.default.val}
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
