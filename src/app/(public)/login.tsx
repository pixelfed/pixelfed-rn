import { Link, router, useNavigation } from 'expo-router'
import {
  Text,
  View,
  Form,
  Button,
  YStack,
  Image,
  Label,
  Input,
  Separator,
  XStack,
} from 'tamagui'
import { useAuth } from '@state/AuthProvider'
import { ActivityIndicator, Platform, SafeAreaView } from 'react-native'
import { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { useI18n } from 'src/hooks/useI18n'

export default function Login() {
  const [server, setServer] = useState('pixelfed.social')
  const [loading, setLoading] = useState(true)
  const { t } = useI18n()

  const { login, isLoading } = useAuth()

  const handleLogin = () => {
    login(server)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <SafeAreaView
      style={{
        backgroundColor: 'black',
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      edges={['top']}
    >
      <StatusBar style="light" />
      {isLoading || loading ? (
        <View m="$5">
          <ActivityIndicator style={'light'} />
        </View>
      ) : (
        <YStack flexGrow={1} w="100%" px="$5">
          <View flexGrow={1} justifyContent="center" alignItems="center">
            <Image
              source={require('../../../assets/icon.png')}
              width={140}
              height={140}
            />
          </View>

          <YStack flexDirection="row" mb={Platform.OS === 'ios' ? 0 : '$5'}>
            <Link href="/selectServer" asChild>
              <Button
                size="$6"
                theme="gray"
                themeInverse={true}
                color="white"
                fontWeight="bold"
                flexGrow={1}
              >
                {t('login')}
              </Button>
            </Link>
          </YStack>
        </YStack>
      )}
    </SafeAreaView>
  )
}
