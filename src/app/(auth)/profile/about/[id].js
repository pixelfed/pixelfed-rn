import { Dimensions, ActivityIndicator } from 'react-native'
import { Button, Text, View, XStack, YStack, ScrollView } from 'tamagui'
import UserAvatar from '@components/common/UserAvatar'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { getAccountById, getAccountRelationship } from 'src/lib/api'
import { formatTimestampMonthYear } from 'src/utils'

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function ProfileScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()

  const getDomain = (url) => {
    let domain = new URL(url)
    return domain.hostname
  }

  const {
    data: user,
    error: userError,
    isFetching: isFetchingUser,
  } = useQuery({
    queryKey: ['getAccountById', id],
    queryFn: getAccountById,
  })

  if (userError) {
    return (
      <View bg="white" flexGrow={1} justifyContent="center" alignItems="center" p="$5">
        <YStack alignItems="center" gap="$2">
          <Text fontSize="$8">Oops, an error occured!</Text>
          <Text fontSize="$5">Please try again later</Text>
          <Button chromeless color="$blue9" size="$6" onPress={() => router.back()}>
            Go back
          </Button>
        </YStack>
      </View>
    )
  }
  const userId = user?.id

  const { data: relationship } = useQuery({
    queryKey: ['getAccountRelationship', userId],
    queryFn: getAccountRelationship,
    enabled: !!userId,
  })

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
        <ActivityIndicator color={'#000'} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['left']} style={{ flex: 1, backgroundColor: 'white' }}>
      <Stack.Screen
        options={{
          title: 'About this account',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView
        contentContainerStyle={{
          flexShrink: 1,
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
            <Text fontSize="$7" fontWeight="bold" flexWrap="wrap">
              {user?.acct}
            </Text>
            <Text fontSize="$5" color="#aaa">
              {user?.url.replaceAll('https://', '')}
            </Text>
            <Text fontSize="$3" mt="$3" px="$3" textAlign="center" color="$gray10">
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
                <Text fontSize="$6" fontWeight={600} fontFamily="System">
                  Admin Account
                </Text>
                <Text fontSize="$5" color="$gray10">
                  This is an admin of{' '}
                  <Text fontWeight="bold" color="$gray10">
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
                <Text fontSize="$6" fontWeight={600} fontFamily="System">
                  Private Account
                </Text>
                <Text fontSize="$5" color="$gray10">
                  Curates who can follow them and see their posts
                </Text>
              </YStack>
            </XStack>
          ) : null}
          <XStack justifyContent="flex-start" alignItems="flex-start" gap="$4">
            <Feather name="calendar" size={36} color="#aaa" />
            <YStack gap={3}>
              <Text fontSize="$6" fontWeight={600} fontFamily="System">
                Account created
              </Text>
              <Text fontSize="$5" color="$gray10">
                {formatTimestampMonthYear(user?.created_at)}
              </Text>
            </YStack>
          </XStack>
          <XStack justifyContent="flex-start" alignItems="flex-start" gap="$4">
            <Feather name="server" size={36} color="#aaa" />
            <YStack gap={3}>
              <Text fontSize="$6" fontWeight={600} fontFamily="System">
                Server
              </Text>
              <Text fontSize="$5" color="$gray10">
                {getDomain(user?.url)}
              </Text>
            </YStack>
          </XStack>
          {user?.discoverable ? (
            <XStack justifyContent="flex-start" alignItems="flex-start" gap="$4">
              <Feather name="compass" size={36} color="#aaa" />
              <YStack gap={3}>
                <Text fontSize="$6" fontWeight={600} fontFamily="System">
                  Discoverable
                </Text>
                <Text fontSize="$5" color="$gray10">
                  Posts from this account may appear in search results
                </Text>
              </YStack>
            </XStack>
          ) : null}
          {user?.pronouns && user?.pronouns.length ? (
            <XStack justifyContent="flex-start" alignItems="flex-start" gap="$4">
              <Feather name="user" size={36} color="#aaa" />
              <YStack gap={3}>
                <Text fontSize="$6" fontWeight={600} fontFamily="System">
                  Pronouns
                </Text>
                <Text fontSize="$5" color="$gray10">
                  {user.pronouns.join(', ')}
                </Text>
              </YStack>
            </XStack>
          ) : null}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
