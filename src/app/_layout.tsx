import Feather from '@expo/vector-icons/Feather'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { TamaguiProvider } from 'tamagui'
import { config } from '../../tamagui.config'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import React, { useEffect } from 'react'

import AuthProvider from '../state/AuthProvider'
import { useColorScheme } from 'react-native'

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: '/login',
}

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
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
    <AuthProvider>
      <TamaguiProvider config={config} defaultTheme={colorScheme}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(auth)/(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(public)/login" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </TamaguiProvider>
    </AuthProvider>
  )
}
