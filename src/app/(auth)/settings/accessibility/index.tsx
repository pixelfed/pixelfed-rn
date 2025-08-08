import { useQuery } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Switch } from 'src/components/form/Switch'
import { getAppSettings } from 'src/lib/api'
import { Storage } from 'src/state/cache'
import { ScrollView, Separator, Text, useTheme, View, XStack, YStack } from 'tamagui'
export default function Screen() {
  const showAltText = Storage.getBoolean('ui.showAltText') == true
  const requireSelfAltText = Storage.getBoolean('ui.requireSelfAltText') == true
  const theme = useTheme()

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
          <ActivityIndicator color={theme.color?.val.default.val} />
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background?.val.default.val }}
      edges={['bottom']}
    >
      <Stack.Screen
        options={{
          title: 'Accessibility',
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView>
        <XStack
          py="$3"
          px="$4"
          bg={theme.background?.val.default.val}
          justifyContent="space-between"
        >
          <YStack maxWidth="60%" gap="$2">
            <Text fontSize="$5" fontWeight={'bold'} color={theme.color?.val.default.val}>
              Show Alt Text Button
            </Text>
            <Text fontSize="$3" color={theme.color?.val.tertiary.val}>
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
        <Separator borderColor={theme.borderColor?.val.default.val} />
        <XStack
          py="$3"
          px="$4"
          bg={theme.background?.val.default.val}
          justifyContent="space-between"
        >
          <YStack maxWidth="60%" gap="$2">
            <Text fontSize="$5" fontWeight={'bold'} color={theme.color?.val.default.val}>
              Require Alt-Text in Compose
            </Text>
            <Text fontSize="$3" color={theme.color?.val.tertiary.val}>
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
        {/* <Separator />
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
        <Separator /> */}
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
