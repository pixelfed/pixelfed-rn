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
  Theme,
} from 'tamagui'
import ProfileHeader from '@components/profile/ProfileHeader'
import { Storage } from 'src/state/cache'
import { getInstanceV1 } from 'src/lib/api'
import { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useLocalSearchParams, Link } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { openBrowserAsync, prettyCount } from '../../../../utils'
import { Switch } from 'src/components/form/Switch'

export default function Screen() {
  const instance = Storage.getString('app.instance')
  const forceSensitive = Storage.getBoolean('ui.forceSensitive') == true
  const legacyCarousel = Storage.getBoolean('ui.legacyCarousel') == true
  const hideCaptions = Storage.getBoolean('ui.hideCaptions') == true

  return (
    <SafeAreaView flex={1} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Appearance',
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView flexShrink={1}>
        <XStack py="$3" px="$4" bg="white" justifyContent="space-between">
          <YStack maxWidth="60%" gap="$2">
            <Text fontSize="$5" fontWeight={'bold'}>
              Force Show Sensitive/NSFW Media
            </Text>
            <Text fontSize="$3" color="$gray9">
              Removes sensitive content warnings and displays media across accounts, feeds
              and hashtags.
            </Text>
          </YStack>
          <Switch
            size="$3"
            defaultChecked={forceSensitive}
            onCheckedChange={(checked) => Storage.set('ui.forceSensitive', checked)}
          >
            <Switch.Thumb animation="quicker" />
          </Switch>
        </XStack>
        <Separator />
        {/* <XStack py="$3" px="$4" bg="white" justifyContent="space-between">
          <YStack maxWidth="60%" gap="$2">
            <Text fontSize="$5" fontWeight={'bold'}>
              Use Legacy Carousel
            </Text>
            <Text fontSize="$3" color="$gray9">
              Uses full width, non-parallax carousels for media album posts.
            </Text>
          </YStack>
          <Switch
            size="$3"
            defaultChecked={legacyCarousel}
            onCheckedChange={(checked) => Storage.set('ui.legacyCarousel', checked)}
          >
            <Switch.Thumb animation="quicker" />
          </Switch>
        </XStack>
        <Separator /> */}
        <XStack py="$3" px="$4" bg="white" justifyContent="space-between">
          <YStack maxWidth="60%" gap="$2">
            <Text fontSize="$5" fontWeight={'bold'}>
              Hide Captions
            </Text>
            <Text fontSize="$3" color="$gray9">
              Hides post captions on feeds
            </Text>
          </YStack>
          <Switch
            size="$3"
            defaultChecked={hideCaptions}
            onCheckedChange={(checked) => Storage.set('ui.hideCaptions', checked)}
          >
            <Switch.Thumb animation="quicker" />
          </Switch>
        </XStack>
        <Separator />
      </ScrollView>
    </SafeAreaView>
  )
}
