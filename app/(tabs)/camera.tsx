import { SafeAreaView } from 'react-native'
import { Button, Text, View, YStack } from 'tamagui'
import { Feather } from '@expo/vector-icons'

export default function CameraScreen() {
  return (
    <SafeAreaView flex={1} alignItems="center" justifyContent="center">
      <YStack gap="$4">
        <Button variant="outlined">
          <Feather name="camera" size={25} color="black" />
          <Text ml="$6" fontSize="$6">
            Take Photo
          </Text>
        </Button>

        <Button variant="outlined">
          <Feather name="film" size={25} color="black" />
          <Text ml="$3" fontSize="$6">
            Upload photo
          </Text>
        </Button>
      </YStack>
    </SafeAreaView>
  )
}
