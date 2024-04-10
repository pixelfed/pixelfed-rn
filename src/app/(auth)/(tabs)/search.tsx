import { SafeAreaView } from 'react-native'
import { Text, View, YStack, Input } from 'tamagui'

export default function SearchScreen() {
  return (
    <SafeAreaView flex={1} alignItems="center">
      <Text fontSize="$8" fontWeight="bold">
        Search
      </Text>

      <Input
        placeholder="Search by hashtag, profile or url"
        alignSelf="stretch"
        m="$6"
        size="$6"
      />
    </SafeAreaView>
  )
}
