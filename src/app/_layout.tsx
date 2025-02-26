import Feather from '@expo/vector-icons/Feather'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { ToastProvider, ToastViewport } from '@tamagui/toast'
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import * as Notifications from 'expo-notifications'
import { Stack, useRouter } from 'expo-router'
import { ShareIntentProvider } from 'expo-share-intent'
import * as SplashScreen from 'expo-splash-screen'
import React, { useEffect } from 'react'
import { type AppStateStatus, LogBox, Platform } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import GlobalToast from 'src/components/notifications/GlobalToast'
import { useAppState } from 'src/hooks/useAppState'
import { useOnlineManager } from 'src/hooks/useOnlineManager'
import { VideoProvider } from 'src/hooks/useVideoProvider'
import { TamaguiProvider } from 'tamagui'
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
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TamaguiProvider config={config} defaultTheme={'light'}>
            <ThemeProvider value={DefaultTheme}>
              <ToastProvider native={false}>
                <VideoProvider>
                  <BottomSheetModalProvider>
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
                        name="(public)/verifyEmail"
                        options={{ headerShown: false }}
                      />
                    </Stack>
                  </BottomSheetModalProvider>
                </VideoProvider>
              </ToastProvider>
            </ThemeProvider>
          </TamaguiProvider>
        </QueryClientProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  )
}
