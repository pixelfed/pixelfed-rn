import { Stack, useLocalSearchParams, router, Link } from 'expo-router'
import { useState } from 'react'
import { Dimensions, Pressable, Switch } from 'react-native'
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
  Button,
  Select,
  styled,
} from 'tamagui'
import { SelectDemo, FormSelect } from 'src/components/form/Select'
import Feather from '@expo/vector-icons/Feather'

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function Page() {
  const { id } = useLocalSearchParams()
  const preview = JSON.parse(id)
  const [captionInput, setCaption] = useState()
  const [isSensitive, setSensitive] = useState(false)
  const [isPreserve, setPreserve] = useState(false)
  const [audienceOptions, setAudienceOptions] = useState([
    {
      key: 1,
      name: 'Public',
      value: 'public',
      description: 'Posts are shared publicly, anyone can view',
    },
    {
      key: 2,
      name: 'Unlisted',
      value: 'unlisted',
      description: 'Posts are shared publicly, but will not appear on public feeds',
    },
    {
      key: 3,
      name: 'Followers Only',
      value: 'followers',
      description: 'Posts will only be shared to your followers',
    },
  ])

  const [licenseOptions, setLicenseOptions] = useState([
    {
      key: 1,
      name: 'All Rights Reserved',
      value: 'public',
      description: 'Posts are shared publicly, anyone can view',
    },
    {
      key: 2,
      name: 'Public Domain Work',
      value: 'unlisted',
      description: 'Posts are shared publicly, but will not appear on public feeds',
    },
    {
      key: 3,
      name: 'Followers Only',
      value: 'followers',
      description: 'Posts will only be shared to your followers',
    },
  ])

  const goNext = () => {
    router.push({ pathname: '/camera/preview', params: { id: JSON.stringify(r) } })
  }

  return (
    <SafeAreaView flex={1} edges={['left']}>
      <Stack.Screen
        options={{
          title: 'New Post',
          headerBackTitle: 'Back',
          headerRight: () => (
            <Pressable flexShrink={1}>
              <Text fontSize="$7" color="$blue10">
                Post
              </Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView flex={1} keyboardDismissMode="on-drag">
        <YStack justifyContent="center" alignItems="center" m="$3" gap="$3">
          <View
            bg="white"
            borderRadius={10}
            overflow="hidden"
            borderWidth={1}
            borderColor="$gray8"
          >
            <Image
              source={{ uri: preview.uri }}
              style={{ width: 400, height: 400, borderRadius: 10 }}
            />
          </View>
          <XStack w="100%" px="$2" mt={-55} gap="$3" justifyContent="space-between">
            <Button bg="black" size="$3" color="white" fontWeight="bold">
              Edit alt text
            </Button>
          </XStack>
        </YStack>
        <YStack mb="$3" mx="$3">
          <TextArea
            size="$4"
            fontSize="$7"
            borderWidth={1}
            value={captionInput}
            onChangeText={setCaption}
            backgroundColor={'white'}
            numberOfLines={4}
            placeholder="Add an optional caption..."
            placeholderTextColor={'#ccc'}
          />
          <XStack px="$3" pt="$1" justifyContent="flex-end">
            <Text color="$gray9">{captionInput ? captionInput?.length : '0'}/2000</Text>
          </XStack>
        </YStack>

        <YStack bg="white" borderTopWidth={1} borderBottomWidth={1} borderColor="$gray6">
          <XStack p="$3" justifyContent="space-between" alignItems="center" gap="$4">
            <XStack alignItems="center" gap="$2">
              <Label paddingLeft="$0" alignItems="center">
                <Text fontSize="$5" color="$gray9">
                  Preserve media, skip optimization
                </Text>
              </Label>
              <Pressable>
                <Feather name="alert-circle" size={17} color="#ccc" />
              </Pressable>
            </XStack>
            <Switch
              trackColor={{ false: '#eeee', true: 'red' }}
              thumbColor={'#fff'}
              ios_backgroundColor="#eee"
              onValueChange={setPreserve}
              value={isPreserve}
            ></Switch>
          </XStack>
        </YStack>
        <YStack bg="white" borderBottomWidth={1} borderColor="$gray6">
          <XStack p="$3" justifyContent="space-between" alignItems="center" gap="$4">
            <XStack alignItems="center" gap="$2">
              <Label paddingLeft="$0" alignItems="center">
                <Text fontSize="$5" color="$gray9">
                  Contains sensitive content
                </Text>
              </Label>
              <Pressable>
                <Feather name="alert-circle" size={17} color="#ccc" />
              </Pressable>
            </XStack>
            <Switch
              trackColor={{ false: '#eeee', true: 'red' }}
              thumbColor={'#fff'}
              ios_backgroundColor="#eee"
              onValueChange={setSensitive}
              value={isSensitive}
            ></Switch>
          </XStack>
        </YStack>
        <YStack bg="white" borderBottomWidth={1} borderColor="$gray6">
          <XStack p="$3" justifyContent="space-between" alignItems="center" gap="$4">
            <FormSelect
              label="Audience"
              options={audienceOptions}
              defaultValue="Public"
            />
          </XStack>
        </YStack>
        <YStack bg="white" borderBottomWidth={1} borderColor="$gray6">
          <XStack p="$3" justifyContent="space-between" alignItems="center" gap="$4">
            <FormSelect
              label="License"
              options={licenseOptions}
              defaultValue="Public Domain Work"
            />
          </XStack>
        </YStack>

        <YStack bg="white" borderBottomWidth={1} borderColor="$gray6">
          <XStack p="$3" justifyContent="space-between" alignItems="center" gap="$4">
            <XStack alignItems="center" gap="$2">
              <Label paddingLeft="$0" alignItems="center">
                <Text fontSize="$5">Location</Text>
              </Label>
            </XStack>
          </XStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
