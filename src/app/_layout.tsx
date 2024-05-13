import Feather from '@expo/vector-icons/Feather'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { TamaguiProvider } from 'tamagui'
import { config } from '../../tamagui.config'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import React, { useEffect } from 'react'
import AuthProvider from '../state/AuthProvider'
import { useColorScheme, type AppStateStatus, Platform } from 'react-native'
export { ErrorBoundary } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query'
import { useAppState } from 'src/hooks/useAppState'
import { useOnlineManager } from 'src/hooks/useOnlineManager'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
export const unstable_settings = {
  initialRouteName: '/login',
}

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

export default function RootLayout() {
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

function RootLayoutNav() {
  const colorScheme = useColorScheme()

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <TamaguiProvider config={config} defaultTheme={'light'}>
              <ThemeProvider value={DefaultTheme}>
                <SafeAreaProvider>
                  <Stack>
                    <Stack.Screen name="(auth)/(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen
                      name="(public)/login"
                      options={{ headerShown: false }}
                    />
                  </Stack>
                </SafeAreaProvider>
              </ThemeProvider>
            </TamaguiProvider>
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  )
}
