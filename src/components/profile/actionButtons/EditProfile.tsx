import { Button, useTheme } from 'tamagui'

export default function EditProfile({ onPress }: { onPress: () => void }) {
  const theme = useTheme()
  return (
    <Button
      theme="light"
      variant="outlined"
      my="$3"
      size="$4"
      borderColor={theme.borderColor?.val.default.val}
      color={theme.color?.val.default.val}
      fontWeight="bold"
      fontSize="$6"
      flexGrow={1}
      onPress={() => onPress()}
    >
      Edit profile
    </Button>
  )
}
