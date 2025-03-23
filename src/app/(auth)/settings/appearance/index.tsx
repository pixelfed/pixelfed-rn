import { Stack, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Switch } from 'src/components/form/Switch'
import { Storage } from 'src/state/cache'
import { 
  ScrollView, 
  Separator, 
  Text, 
  XStack, 
  YStack, 
  useTheme, 
  Select, 
  Adapt, 
  Sheet, 
  Button,
  useThemeName
} from 'tamagui'
import { useState, useEffect, useCallback } from 'react'
import Feather from '@expo/vector-icons/Feather'
import { useColorScheme } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'

export default function Screen() {
  const forceSensitive = Storage.getBoolean('ui.forceSensitive') == true
  const hideCaptions = Storage.getBoolean('ui.hideCaptions') == true
  const tamaguiTheme = useTheme()
  const tamaguiThemeName = useThemeName()
  const colorScheme = useColorScheme()
  const navigation = useNavigation()
  const theme = useTheme();  
  const router = useRouter();
  // Available themes
  const themes = [
    { name: 'Light', value: 'light' },
    { name: 'Dark', value: 'dark' },
    { name: 'Slate Dark', value: 'slateDark' },
    { name: 'Hot Pink', value: 'hotPink' }
  ]

  const statusBarMap = {
    'light': 'dark',
    'dark': 'light',
    'slateDark': 'light',
    'hotPink': 'dark'
  }
  
  // Get stored theme or use system default
  const getStoredTheme = useCallback(() => {
    const storedTheme = Storage.getString('ui.theme')
    return storedTheme || tamaguiThemeName
  }, [tamaguiThemeName])
  
  // Handle theme change
  const handleThemeChange = useCallback((value) => {
    Storage.set('ui.theme', value)
  }, [])

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.background?.val.default.val}} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Appearance',
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView flexShrink={1}>
        {/* Theme Selector */}
        <XStack py="$3" px="$4" bg={tamaguiTheme.background?.val.secondary.val} justifyContent="space-between">
          <YStack maxWidth="60%" gap="$2">
            <Text fontSize="$5" fontWeight={'bold'} color={tamaguiTheme.color?.val.default.val}>
              Theme
            </Text>
            <Text fontSize="$3" color={tamaguiTheme.color?.val.tertiary.val}>
              Choose your preferred theme
            </Text>
          </YStack>
          <Select
            value={getStoredTheme()}
            onValueChange={handleThemeChange}
            disablePreventBodyScroll
          > 
            <Select.Trigger  borderColor={theme.borderColor?.val.default.val} width="$12" bg={theme.background?.val.default.val} iconAfter={<Feather name="chevron-down" color={theme.color?.val.default.val} />}>
              <Select.Value placeholder="Select Theme" color={theme.color?.val.default.val} />
            </Select.Trigger>
            
            <Adapt when="sm" platform="touch">
              <Sheet modal dismissOnSnapToBottom>
                <Sheet.Frame backgroundColor={theme.background?.val.default.val}>
                  <Sheet.ScrollView>
                    <Adapt.Contents />
                  </Sheet.ScrollView>
                </Sheet.Frame>
                <Sheet.Overlay />
              </Sheet>
            </Adapt>
            
            <Select.Content>
              <Select.ScrollUpButton color={theme.background?.val.tertiary.val} />
              <Select.Viewport >
                <Select.Group>
                  <Select.Label bg={theme.background?.val.secondary.val} color={theme.color?.val.default.val} >Themes</Select.Label>
                  {themes.map((themeOption) => (
                    <Select.Item key={themeOption.value} value={themeOption.value} py={10} justifyContent="center" alignItem="center" borderBottomWidth={1} borderColor={theme.borderColor?.val.default.val}>
                      <Select.ItemText color={theme.color?.val.default.val} fontSize={20}>{themeOption.name}</Select.ItemText>
                      <Select.ItemIndicator>
                        <Feather name="check-circle" color={theme.color?.val.default.val} size={20} style={{marginLeft: 10}} />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.Viewport>
              <Select.ScrollDownButton />
            </Select.Content>
          </Select>
        </XStack>
        <Separator borderColor={tamaguiTheme.borderColor?.val.default.val} />
        
        {/* Force Show Sensitive/NSFW Media */}
        <XStack py="$3" px="$4" bg={tamaguiTheme.background?.val.secondary.val} justifyContent="space-between">
          <YStack maxWidth="60%" gap="$2">
            <Text fontSize="$5" fontWeight={'bold'} color={tamaguiTheme.color?.val.default.val}>
              Force Show Sensitive/NSFW Media
            </Text>
            <Text fontSize="$3" color={tamaguiTheme.color?.val.tertiary.val}>
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
        <Separator borderColor={tamaguiTheme.borderColor?.val.default.val} />
        
        {/* Hide Captions */}
        <XStack py="$3" px="$4" bg={tamaguiTheme.background?.val.secondary.val} justifyContent="space-between">
          <YStack maxWidth="60%" gap="$2">
            <Text fontSize="$5" fontWeight={'bold'} color={tamaguiTheme.color?.val.default.val}>
              Hide Captions
            </Text>
            <Text fontSize="$3" color={tamaguiTheme.color?.val.tertiary.val}>
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
        <Separator borderColor={tamaguiTheme.borderColor?.val.default.val} />
      </ScrollView>
    </SafeAreaView>
  )
}
