import { SafeAreaView } from 'react-native'
import { Text, View, YStack, Button, Separator } from 'tamagui'
import { useNavigation } from 'expo-router'

export default function AboutScreen() {
  const navigation = useNavigation()

  return (
    <SafeAreaView flex={1}>
      <YStack alignItems="center" justifyContent="center" flexGrow={1} gap="$5" mx="$6">
        <Text fontSize={30}>Pixelfed</Text>

        <Text fontSize={20}>Pixelfed is a photo and video sharing platform.</Text>

        <Button size="$3" fontSize={20} chromeless onPress={() => navigation.goBack()}>
          Go back
        </Button>
      </YStack>
    </SafeAreaView>
  )
}
