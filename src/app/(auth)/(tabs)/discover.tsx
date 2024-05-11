import { SafeAreaView } from 'react-native'
import { Text, YStack, Button } from 'tamagui'
import { Storage } from 'src/state/cache'
import { useEffect } from 'react'

export default function DiscoverScreen() {
  const cacheClear = () => {
    Storage.clearAll()
  }

  return (
    <SafeAreaView flex={1} alignItems="center">
      <Text fontSize={20}>Discover</Text>
      <YStack flexGrow={1} alignSelf="stretch" m="$5" gap="$3">
        <Button
          theme="light"
          size="$6"
          bg="$red8"
          color="white"
          fontWeight="bold"
          onPress={() => cacheClear()}
        >
          Cache Clear
        </Button>
      </YStack>
    </SafeAreaView>
  )
}
