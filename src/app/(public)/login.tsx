import { Link } from 'expo-router'
import {
  View,
  Button,
  YStack,
  Image,
} from 'tamagui'
import { Platform, SafeAreaView, StyleSheet } from 'react-native'
import { StatusBar } from 'expo-status-bar'

export default function Login() {
  return (
    <SafeAreaView style={styles.background} >
      <StatusBar style="light" />
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
              Login
            </Button>
          </Link>
        </YStack>
      </YStack>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: 'black',
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
})
