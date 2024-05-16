import { Stack, useLocalSearchParams, router, Link } from 'expo-router'
import { Dimensions, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, Image, ScrollView } from 'tamagui'

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function Page() {
  const { id } = useLocalSearchParams()
  const preview = JSON.parse(id)

  const goNext = () => {
    router.push({ pathname: '/camera/caption', params: { id: JSON.stringify(preview) } })
  }

  return (
    <SafeAreaView flex={1} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Preview',
          headerBackTitle: 'Back',
          headerRight: () => (
            <Pressable onPress={() => goNext()}>
              <Text fontSize="$7" color="$blue10">
                Next
              </Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView flex={1}>
        <Image
          source={{ uri: preview.uri }}
          style={{
            width: SCREEN_WIDTH,
            height: SCREEN_WIDTH * (preview.height / preview.width),
          }}
          resizeMode="contain"
        />
      </ScrollView>
    </SafeAreaView>
  )
}
