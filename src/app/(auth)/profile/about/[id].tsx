import UserAvatar from '@components/common/UserAvatar'
import { Feather } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getAccountById, getAccountRelationship } from 'src/lib/api'
import { formatTimestamp, formatTimestampMonthYear, getDomain } from 'src/utils'
import { Button, ScrollView, Text, useTheme, View, XStack, YStack } from 'tamagui'

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const theme = useTheme()

  const {
    data: user,
    error: userError,
    isFetching: isFetchingUser,
  } = useQuery({
    queryKey: ['getAccountById', id],
    queryFn: () => getAccountById(id),
  })

  const userId = user?.id
  const { data: relationship } = useQuery({
    queryKey: ['getAccountRelationship', userId],
    queryFn: () => getAccountRelationship(userId!),
    enabled: !!userId,
  })

  if (userError) {
    return (
      <View
        bg={theme.background.val.default.val}
        flexGrow={1}
        justifyContent="center"
        alignItems="center"
        p="$5"
      >
        <YStack alignItems="center" gap="$2">
          <Text fontSize="$8" color={theme.color.val.default.val}>
            Oops, an error occurred!
          </Text>
          <Text fontSize="$5" color={theme.color.val.secondary.val}>
            Please try again later
          </Text>
          <Button
            chromeless
            color={theme.colorHover.val.active.val}
            size="$6"
            onPress={() => router.back()}
          >
            Go back
          </Button>
        </YStack>
      </View>
    )
  }

  if (isFetchingUser) {
    return (
      <SafeAreaView edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerBackTitle: 'Back',
            title: 'About this account',
          }}
        />
        <ActivityIndicator color={theme.color.val.default.val} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView
      edges={['left']}
      style={{ flex: 1, backgroundColor: theme.background.val.default.val }}
    >
      <Stack.Screen
        options={{
          title: 'About this account',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView
        contentContainerStyle={{
          padding: '$5',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <YStack
          justifyContent="center"
          alignItems="center"
          gap="$4"
          flexWrap="wrap"
          mb="$5"
        >
          <UserAvatar url={user?.avatar} size="$10" />
          <YStack justifyContent="center" alignItems="center" gap="$1" flexWrap="wrap">
            <Text
              fontSize="$7"
              fontWeight="bold"
              flexWrap="wrap"
              color={theme.color.val.default.val}
            >
              {user?.acct}
            </Text>
            <Text fontSize="$5" color="#aaa">
              {user?.url.replaceAll('https://', '')}
            </Text>
            <Text
              fontSize="$3"
              mt="$3"
              px="$3"
              textAlign="center"
              color={theme.color.val.tertiary.val}
            >
              To help keep our community authentic, we're showing information about
              accounts on Pixelfed and other fediverse servers.
            </Text>
          </YStack>
        </YStack>

        <YStack
          w="100%"
          justifyContent="flex-start"
          alignItems="flex-start"
          gap="$6"
          my="$3"
          pr="$10"
        >
          {user?.is_admin ? (
            <XStack justifyContent="flex-start" alignItems="flex-start" gap="$4">
              <Feather name="shield" size={36} color="#aaa" />
              <YStack gap={3}>
                <Text
                  fontSize="$6"
                  fontWeight={600}
                  fontFamily="System"
                  color={theme.color.val.default.val}
                >
                  Admin Account
                </Text>
                <Text fontSize="$5" color={theme.color.val.secondary.val}>
                  This is an admin of{' '}
                  <Text fontWeight="bold" color={theme.color.val.secondary.val}>
                    {getDomain(user?.url)}
                  </Text>
                </Text>
              </YStack>
            </XStack>
          ) : null}
          {user?.locked ? (
            <XStack justifyContent="flex-start" alignItems="flex-start" gap="$4">
              <Feather name="lock" size={36} color="#aaa" />
              <YStack gap={3}>
                <Text
                  fontSize="$6"
                  fontWeight={600}
                  fontFamily="System"
                  color={theme.color.val.default.val}
                >
                  Private Account
                </Text>
                <Text fontSize="$5" color={theme.color.val.secondary.val}>
                  Curates who can follow them and see their posts
                </Text>
              </YStack>
            </XStack>
          ) : null}
          <XStack justifyContent="flex-start" alignItems="flex-start" gap="$4">
            <Feather name="calendar" size={36} color="#aaa" />
            <YStack gap={3}>
              <Text
                fontSize="$6"
                fontWeight={600}
                fontFamily="System"
                color={theme.color.val.default.val}
              >
                Account created
              </Text>
              <Text fontSize="$5" color={theme.color.val.secondary.val}>
                {formatTimestampMonthYear(user?.created_at)}
              </Text>
            </YStack>
          </XStack>
          {relationship?.following ? (
            <XStack justifyContent="flex-start" alignItems="flex-start" gap="$4">
              <Feather name="user-plus" size={36} color="#aaa" />
              <YStack gap={3}>
                <Text
                  fontSize="$6"
                  fontWeight={600}
                  fontFamily="System"
                  color={theme.color.val.default.val}
                >
                  Relationship Status
                </Text>
                {relationship?.following_since ? (
                  <Text fontSize="$5" color={theme.color.val.secondary.val}>
                    You've followed this account since{' '}
                    <Text
                      color="$gray10"
                      fontSize="$5"
                      fontWeight={600}
                      fontFamily="System"
                    >
                      {formatTimestampMonthYear(relationship.following_since)}
                    </Text>
                  </Text>
                ) : (
                  <Text fontSize="$5" color={theme.color.val.secondary.val}>
                    You're following this account
                  </Text>
                )}
              </YStack>
            </XStack>
          ) : null}
          {relationship?.followed_by ? (
            <XStack justifyContent="flex-start" alignItems="flex-start" gap="$4">
              <Feather name="users" size={36} color="#aaa" />
              <YStack gap={3}>
                <Text
                  fontSize="$6"
                  fontWeight={600}
                  fontFamily="System"
                  color={theme.color.val.default.val}
                >
                  Follower Status
                </Text>
                <Text fontSize="$5" color={theme.color.val.secondary.val}>
                  This account is following you
                </Text>
              </YStack>
            </XStack>
          ) : null}
          <XStack justifyContent="flex-start" alignItems="flex-start" gap="$4">
            <Feather name="server" size={36} color="#aaa" />
            <YStack gap={3}>
              <Text
                fontSize="$6"
                fontWeight={600}
                fontFamily="System"
                color={theme.color.val.default.val}
              >
                Server
              </Text>
              <Text fontSize="$5" color={theme.color.val.secondary.val}>
                {getDomain(user?.url)}
              </Text>
            </YStack>
          </XStack>
          {user?.discoverable ? (
            <XStack justifyContent="flex-start" alignItems="flex-start" gap="$4">
              <Feather name="compass" size={36} color="#aaa" />
              <YStack gap={3}>
                <Text
                  fontSize="$6"
                  fontWeight={600}
                  fontFamily="System"
                  color={theme.color.val.default.val}
                >
                  Discoverable
                </Text>
                <Text fontSize="$5" color={theme.color.val.secondary.val}>
                  Posts from this account may appear in search results
                </Text>
              </YStack>
            </XStack>
          ) : null}
          {user?.pronouns && user?.pronouns.length ? (
            <XStack justifyContent="flex-start" alignItems="flex-start" gap="$4">
              <Feather name="user" size={36} color="#aaa" />
              <YStack gap={3}>
                <Text
                  fontSize="$6"
                  fontWeight={600}
                  fontFamily="System"
                  color={theme.color.val.default.val}
                >
                  Pronouns
                </Text>
                <Text fontSize="$5" color={theme.color.val.secondary.val}>
                  {user.pronouns.join(', ')}
                </Text>
              </YStack>
            </XStack>
          ) : null}
          {user?.local == false && user?.last_fetched_at ? (
            <XStack justifyContent="flex-start" alignItems="flex-start" gap="$4">
              <Feather name="clock" size={36} color="#aaa" />
              <YStack gap={3}>
                <Text
                  fontSize="$6"
                  fontWeight={600}
                  fontFamily="System"
                  color={theme.color.val.default.val}
                >
                  Last fetched at
                </Text>
                <Text fontSize="$5" color={theme.color.val.secondary.val}>
                  Account was last updated {formatTimestamp(user?.last_fetched_at)}
                </Text>
              </YStack>
            </XStack>
          ) : null}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
