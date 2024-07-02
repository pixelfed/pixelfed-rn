import { Pressable } from 'react-native'
import { Text, XStack } from 'tamagui'
import { Feather } from '@expo/vector-icons'
import { Link } from 'expo-router'

export default (FeedHeader = ({ title = 'Home', user }) => {
  return (
    <XStack
      px="$3"
      pb="$3"
      bg="white"
      justifyContent="space-between"
      alignItems="center"
      zIndex={100}
      borderBottomWidth={0.5}
      borderBottomColor="$gray5"
    >
      <XStack alignItems="center" gap="$1">
        <Text fontSize={30} fontWeight="bold" letterSpacing={-1}>
          {title}
        </Text>
      </XStack>
      <XStack gap="$5">
        {user?.is_admin ? (
          <Link href="/admin/" asChild>
            <Pressable>
              <Feather name="tool" size={26} color="red" />
            </Pressable>
          </Link>
        ) : null}
        <Link href="/notifications" asChild>
          <Pressable>
            <Feather name="bell" size={26} />
          </Pressable>
        </Link>
        <Link href="/chats" asChild>
          <Pressable>
            <Feather name="mail" size={26} />
          </Pressable>
        </Link>
        <Link href="/search" asChild>
          <Pressable>
            <Feather name="search" size={26} />
          </Pressable>
        </Link>
      </XStack>
    </XStack>
  )
})
