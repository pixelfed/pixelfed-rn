import { Button, XStack, useTheme } from 'tamagui'

export default function BlockingProfile({ onPress }: { onPress: () => void }) {
  const theme = useTheme();

  return (
    <XStack w="100%" my="$3" gap="$2">
      <Button
        theme="light"
        bg="#000"
        size="$4"
        color="white"
        borderColor={theme.borderColor?.val.default.val}
        fontWeight="bold"
        fontSize="$6"
        flexGrow={1}
        onPress={() => onPress()}
      >
        Blocked
      </Button>
    </XStack>
  )
}
