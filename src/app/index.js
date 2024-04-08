import { SafeAreaView } from 'react-native'
import { Text, View, YStack, Button } from 'tamagui'
import { useNavigation } from 'expo-router'

export default function HomeScreen() {
  const navigation = useNavigation()

  return (
    <SafeAreaView flex={1}>
      <YStack alignItems="center" justifyContent="center" flexGrow={1} gap="$5" mx="$6">
        <Text fontSize={30}>Pixelfed</Text>

        <Button
          alignSelf="stretch"
          size="$6"
          fontSize={20}
          onPress={() => navigation.navigate('sign-in')}
        >
          Sign In
        </Button>

        <Button
          size="$3"
          fontSize={20}
          chromeless
          onPress={() => navigation.navigate('about')}
        >
          About
        </Button>
      </YStack>
    </SafeAreaView>
  )
}
