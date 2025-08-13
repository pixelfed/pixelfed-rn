import { Feather } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { Platform, Pressable } from 'react-native'
import { Text, useTheme, XStack } from 'tamagui'

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
        {title === 'Pixelfed' ? (
          <Link
            accessible={true}
            accessibilityLabel="Open local feed" // UI calls it Public Feed, but it's actually Local. Other changes required?
            accessibilityRole="button"
            href="/feeds/network" 
            asChild>
            <Pressable hitSlop={12}>
              <Feather name="globe" size={26} color={textColor} />
            </Pressable>
          </Link>
        ) : (
          <Link 
            accessible={true}
            accessibilityLabel="Home"
            accessibilityRole="button"
            href="/" 
            asChild>
            <Pressable hitSlop={12}>
              <Feather name="home" size={26} color={textColor} />
            </Pressable>
          </Link>
        )}
        <Link 
          accessible={true}
          accessibilityLabel="Direct messages"
          accessibilityRole="button"
          href="/chats"
          asChild>
          <Pressable hitSlop={12}>
            <Feather name="mail" size={26} color={textColor} />
          </Pressable>
        </Link>
        <Link 
          accessible={true}
          accessibilityLabel="Search"
          accessibilityRole="button"
          href="/search" 
          asChild>
          <Pressable hitSlop={12}>
            <Feather name="search" size={26} color={textColor} />
          </Pressable>
        </Link>
      </XStack>
    </XStack>
  )
}
