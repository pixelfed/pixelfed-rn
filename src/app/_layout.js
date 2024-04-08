import { Slot } from 'expo-router'
import { SessionProvider } from '../state/ctx'
import { TamaguiProvider } from 'tamagui'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { config } from '../../tamagui.config'
import { useColorScheme } from 'react-native'

export default function Root() {
  const colorScheme = useColorScheme()
  // Set up the auth context and render our layout inside of it.
  return (
    <TamaguiProvider config={config} defaultTheme={colorScheme}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SessionProvider>
          <Slot />
        </SessionProvider>
      </ThemeProvider>
    </TamaguiProvider>
  )
}
