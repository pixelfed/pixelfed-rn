import { Feather } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { Platform, Pressable } from 'react-native'
import { Text, XStack, useTheme } from 'tamagui'

export default function FeedHeader({ title = 'Home', user }) {
  const theme = useTheme()
  const textColor = theme.color.val.default.val
  
  return (
    <XStack
      px="$3"
      pb="$3"
      pt={Platform.OS === 'android' ? '$3' : 0}
      backgroundColor="$background.default"
      justifyContent="space-between"
      alignItems="center"
      zIndex={100}
      borderBottomWidth={0}
    >
      <XStack alignItems="center" gap="$1">
        <Text
          color={textColor}
          fontSize={title === 'Pixelfed' ? 25 : 19}
          lineHeight={30}
          fontWeight="bold"
          letterSpacing={-0.5}
          allowFontScaling={false}
        >
          {title}
        </Text>
      </XStack>
      <XStack gap="$5">
        <Link href="/discover" asChild>
          <Pressable>
            <Feather name="compass" size={26} color={textColor} />
          </Pressable>
        </Link>
        <Link href="/chats" asChild>
          <Pressable>
            <Feather name="mail" size={26} color={textColor} />
          </Pressable>
        </Link>
        <Link href="/search" asChild>
          <Pressable>
            <Feather name="search" size={26} color={textColor} />
          </Pressable>
        </Link>
      </XStack>
    </XStack>
  )
}