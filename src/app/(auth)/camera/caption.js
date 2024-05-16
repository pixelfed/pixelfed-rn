import { Stack, useLocalSearchParams, router, Link } from 'expo-router'
import { useState } from 'react'
import { Dimensions, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  View,
  Text,
  Image,
  ScrollView,
  TextArea,
  YStack,
  XStack,
  Label,
  Separator,
  Switch,
  styled,
} from 'tamagui'

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function Page() {
  const { id } = useLocalSearchParams()
  const preview = JSON.parse(id)
  const [captionInput, setCaption] = useState()
  const [isSensitive, setSensitive] = useState(false)

  const goNext = () => {
    router.push({ pathname: '/camera/preview', params: { id: JSON.stringify(r) } })
  }

  return (
    <SafeAreaView flex={1} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'New Post',
          headerBackTitle: 'Back',
          headerRight: () => (
            <Pressable>
              <Text fontSize="$7" color="$blue10">
                Post
              </Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView flex={1}>
        <YStack>
          <TextArea
            size="$4"
            fontSize="$7"
            borderWidth={1}
            value={captionInput}
            onChangeText={setCaption}
            backgroundColor={'white'}
            numberOfLines={6}
            placeholder="Add a caption here..."
            placeholderTextColor={'#ccc'}
          />
          <XStack p="$3">
            <Text>{captionInput ? captionInput?.length : '0'}/200</Text>
          </XStack>
        </YStack>

        <YStack bg="white" borderTopWidth={1} borderBottomWidth={1} borderColor="$gray6">
          <XStack p="$3" justifyContent="space-between" alignItems="center" gap="$4">
            <Label paddingLeft="$0" size={'$5'}>
              Contains sensitive content
            </Label>
            <Separator minHeight={20} vertical />
            <Switch
              size={'$3'}
              defaultChecked={false}
              value={isSensitive}
              onCheckedChange={setSensitive}
            >
              <Switch.Thumb animation="quicker" />
            </Switch>
          </XStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
