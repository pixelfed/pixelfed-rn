import Feather from '@expo/vector-icons/Feather'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { ToastProvider, ToastViewport } from '@tamagui/toast'
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import * as Notifications from 'expo-notifications'
import { Stack, useRouter } from 'expo-router'
import { ShareIntentProvider } from 'expo-share-intent'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import {
  type AppStateStatus,
  Appearance,
  LogBox,
  Platform,
  useColorScheme,
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import GlobalToast from 'src/components/notifications/GlobalToast'
import { useAppState } from 'src/hooks/useAppState'
import { useOnlineManager } from 'src/hooks/useOnlineManager'
import { VideoProvider } from 'src/hooks/useVideoProvider'
import { Storage } from 'src/state/cache'
import { TamaguiProvider, Theme } from 'tamagui'
import { config } from '../../tamagui.config'
import AuthProvider from '../state/AuthProvider'

export const unstable_settings = {
  backBehavior: 'history',
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

LogBox.ignoreAllLogs()

SplashScreen.preventAutoHideAsync()

function onAppStateChange(status: AppStateStatus) {
  // React Query already supports in web browser refetch on window focus by default
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active')
  }
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2 } },
})

// Theme configurations
const customLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
  },
}

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
  },
}

const slateTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#2F3542',
    card: '#3A4050',
    text: '#FFFFFF',
    border: '#4B5563',
  },
}

const hotPinkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#EC4899',
    background: '#FFFFFF',
    card: '#FDF2F8',
    text: '#831843',
    border: '#F9A8D4',
  },
}

const statusBarMap = {
  light: 'dark',
  dark: 'light',
  slateDark: 'light',
  hotPink: 'dark',
}

const navigationThemeMap = {
  auto: customLightTheme,
  light: customLightTheme,
  dark: customDarkTheme,
  slateDark: slateTheme,
  hotPink: hotPinkTheme,
}

const statusBarBackgroundColorMap = {
  auto: '#fff',
  light: '#fff',
  dark: '#000',
  slateDark: '#2F3542',
  hotPink: '#FFFFFF',
}

function RootLayout() {
  useOnlineManager()
  useAppState(onAppStateChange)

  const [loaded, error] = useFonts({
    ...Feather.font,
  })

  useEffect(() => {
    if (error) throw error
  }, [error])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) return null

  return <RootLayoutNav />
}

export default function RootLayoutWithContext() {
  const router = useRouter()
  return (
    <ShareIntentProvider
      options={{
        debug: false,
        resetOnBackground: true,
        onResetShareIntent: () =>
          router.replace({
            pathname: '/',
          }),
      }}
    >
      <RootLayout />
    </ShareIntentProvider>
  )
}

function RootLayoutNav() {
  const deviceTheme = useColorScheme()
  const [currentTheme, setCurrentTheme] = useState(deviceTheme || 'light')
  const [statusBarStyle, setStatusBarStyle] = useState(
    statusBarMap[currentTheme] || 'auto'
  )

  // Load the theme from storage on initial render
  useEffect(() => {
    const storedTheme = Storage.getString('ui.theme')
    if (
      storedTheme &&
      ['light', 'dark', 'slateDark', 'hotPink', 'system'].includes(storedTheme)
    ) {
      if (storedTheme === 'system') {
        setCurrentTheme(deviceTheme)
        setStatusBarStyle(statusBarMap[deviceTheme])
        return
      }
      setCurrentTheme(storedTheme)
      setStatusBarStyle(statusBarMap[storedTheme] || 'auto')
    }
  }, [])

  // Listen for MMKV storage changes to update the theme
  useEffect(() => {
    // Set up a listener for MMKV storage changes
    const listener = Storage.addOnValueChangedListener((key) => {
      if (key === 'ui.theme') {
        const newTheme = Storage.getString('ui.theme')
        if (newTheme) {
          if (newTheme === 'system') {
            setCurrentTheme(deviceTheme)
            setStatusBarStyle(statusBarMap[deviceTheme])
            return
          }
          setCurrentTheme(newTheme)
          setStatusBarStyle(statusBarMap[newTheme] || 'auto')
        }
      }
    })

    const deviceThemeChangeListener = Appearance.addChangeListener(
      ({ colorScheme: newColorScheme }) => {
        const newTheme = Storage.getString('ui.theme')
        if (newTheme === 'system') {
          setCurrentTheme(newColorScheme)
          setStatusBarStyle(statusBarMap[newColorScheme])
          return
        }
      }
    )

    return () => {
      // Clean up the listener
      listener.remove()
      deviceThemeChangeListener.remove()
    }
  }, [])

  // Select the navigation theme based on current theme
  const navigationTheme =
    navigationThemeMap[currentTheme] ||
    (currentTheme === 'dark' ? customDarkTheme : customLightTheme)

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TamaguiProvider config={config} defaultTheme={currentTheme}>
            <Theme name={currentTheme}>
              <ThemeProvider value={navigationTheme}>
                <ToastProvider native={false}>
                  <VideoProvider>
                    <BottomSheetModalProvider>
                      <StatusBar
                        style={statusBarStyle}
                        backgroundColor={statusBarBackgroundColorMap[currentTheme]}
                        animated
                      />
                      <ToastViewport padding="$6" bottom={0} left={0} right={0} />
                      <GlobalToast />
                      <Stack>
                        <Stack.Screen
                          name="(auth)/(tabs)"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="(public)/login"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="(public)/handleLogin"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="(public)/handleSignup"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="(public)/verifyEmail"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="(public)/verificationCode"
                          options={{ headerShown: false }}
                        />
                      </Stack>
                    </BottomSheetModalProvider>
                  </VideoProvider>
                </ToastProvider>
              </ThemeProvider>
            </Theme>
          </TamaguiProvider>
        </QueryClientProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  )
}
