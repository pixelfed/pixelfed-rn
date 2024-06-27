import { Button } from 'tamagui'

export default function EditProfile({onPress}) {
  return (
    <Button
      theme="light"
      my="$3"
      bg="$gray7"
      size="$4"
      color="black"
      fontWeight="bold"
      fontSize="$6"
      flexGrow={1}
      onPress={() => onPress()}
    >
      Edit profile
    </Button>
  )
}
