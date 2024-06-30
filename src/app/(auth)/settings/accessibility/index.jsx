import { Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getAppSettings } from 'src/lib/api'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import FastImage from 'react-native-fast-image'
import { openBrowserAsync, prettyCount } from '../../../../utils'
import { FlatList, Dimensions, ActivityIndicator, Alert } from 'react-native'
import {
  Group,
  Image,
  ScrollView,
  Separator,
  Text,
  View,
  XGroup,
  XStack,
  YStack,
  Button,
} from 'tamagui'
import { Storage } from 'src/state/cache'
import { Switch } from 'src/components/form/Switch'
export default function Screen() {
  const instance = Storage.getString('app.instance')
  const showAltText = Storage.getBoolean('ui.showAltText') == true
  const requireSelfAltText = Storage.getBoolean('ui.requireSelfAltText') == true

  const { data, isPending, error } = useQuery({
    queryKey: ['getAppSettings'],
    queryFn: getAppSettings,
  })

  if (isPending) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Loading',
            headerBackTitle: 'Back',
          }}
        />
        <View flexGrow={1} mt="$5">
          <ActivityIndicator color={'#000'} />
        </View>
      </>
    )
  }

  if (error) {
    return (
      <View flexGrow={1}>
        <Text>Error</Text>
      </View>
    )
  }
  return (
    <SafeAreaView flex={1} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Accessibility',
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView>
        <XStack py="$3" px="$4" bg="white" justifyContent="space-between">
          <YStack maxWidth="60%" gap="$2">
            <Text fontSize="$5" fontWeight={'bold'}>
              Show Alt Text Button
            </Text>
            <Text fontSize="$3" color="$gray9">
              Adds a tappable button on the bottom right corner of media to easily view
              alt text
            </Text>
          </YStack>
          <Switch
            size="$3"
            defaultChecked={showAltText}
            onCheckedChange={(checked) => Storage.set('ui.showAltText', checked)}
          >
            <Switch.Thumb animation="quicker" />
          </Switch>
        </XStack>
        <Separator />
        <XStack py="$3" px="$4" bg="white" justifyContent="space-between">
          <YStack maxWidth="60%" gap="$2">
            <Text fontSize="$5" fontWeight={'bold'}>
              Require Alt-Text in Compose
            </Text>
            <Text fontSize="$3" color="$gray9">
              Require yourself to add alt-text to posts you compose before they can be
              shared
            </Text>
          </YStack>
          <Switch
            size="$3"
            defaultChecked={requireSelfAltText}
            onCheckedChange={(checked) => Storage.set('ui.requireSelfAltText', checked)}
          >
            <Switch.Thumb animation="quicker" />
          </Switch>
        </XStack>
        <Separator />
        <XStack py="$3" px="$4" bg="white" justifyContent="space-between">
          <YStack maxWidth="60%" gap="$2">
            <Text fontSize="$5" fontWeight={'bold'}>
              Require Alt-Text in Feeds
            </Text>
            <Text fontSize="$3" color="$gray9">
              Hide posts without alt-text in feeds
            </Text>
          </YStack>
          <Switch size="$3" defaultChecked={false}>
            <Switch.Thumb animation="quicker" />
          </Switch>
        </XStack>
        <Separator />
        {/* <XStack py="$3" px="$4" bg="white" justifyContent="space-between">
          <YStack maxWidth="60%" gap="$2">
            <Text fontSize="$5" fontWeight={'bold'}>
              Reduce Motion
            </Text>
            <Text fontSize="$3" color="$gray9">
              Disable all animations and auto play media
            </Text>
          </YStack>
          <Switch size="$3" defaultChecked={false}>
            <Switch.Thumb animation="quicker" />
          </Switch>
        </XStack>
        <Separator /> */}
        {/* <XStack py="$3" px="$4" bg="white" justifyContent="space-between">
          <YStack maxWidth="60%" gap="$2">
            <Text fontSize="$5" fontWeight={'bold'}>
              Hide videos
            </Text>
            <Text fontSize="$3" color="$gray9">
              Hide all video posts in feeds and discover
            </Text>
          </YStack>
          <Switch size="$3" defaultChecked={false}>
            <Switch.Thumb animation="quicker" />
          </Switch>
        </XStack> */}
        {/* <Separator />
        <XStack py="$3" px="$4" bg="white" justifyContent="space-between">
          <YStack maxWidth="60%" gap="$2">
            <Text fontSize="$5" fontWeight={'bold'}>
              High Contrast Mode
            </Text>
            <Text fontSize="$3" color="$gray9">
              Enable the high contrast UI
            </Text>
          </YStack>
          <Switch size="$3" defaultChecked={false}>
            <Switch.Thumb animation="quicker" />
          </Switch>
        </XStack> */}
      </ScrollView>
    </SafeAreaView>
  )
}
