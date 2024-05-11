import { FlatList, Dimensions, ActivityIndicator, Alert } from 'react-native'
import {
  Group,
  Image,
  ScrollView,
  Separator,
  Text,
  View,
  XStack,
  YStack,
  Button,
  Avatar,
} from 'tamagui'
import ProfileHeader from '@components/profile/ProfileHeader'
import { Storage } from 'src/state/cache'
import { queryApi } from 'src/requests'
import { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, Link } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { getAccountById, getAccountStatusesById } from 'src/lib/api'

export default function Page() {
  const userCache = JSON.parse(Storage.getString('user.profile'))

  const { data: user } = useQuery({
    queryKey: ['profileById', userCache.id],
    queryFn: getAccountById,
  })

  const LinkField = ({ label, value, placeholder, path, border }) => (
    <XStack px="$3" py="$3" alignItems="start" justifyContent="center">
      <Text w="30%" fontSize="$6" color="$gray9">
        {label}
      </Text>
      {path ? (
        <View
          w="70%"
          flexGrow={1}
          overflow="hidden"
          flexWrap="wrap"
          pb="$3"
          borderBottomWidth={border ? 1 : 0}
          borderBottomColor="$gray4"
        >
          <Link href={path}>
            <Text fontSize="$6" flexWrap="wrap">
              {value}
            </Text>
          </Link>
        </View>
      ) : (
        <View
          w="70%"
          flexGrow={1}
          overflow="hidden"
          flexWrap="wrap"
          pb="$3"
          borderBottomWidth={border ? 1 : 0}
          borderBottomColor="$gray4"
        >
          <Text fontSize="$6" flexWrap="wrap">
            {value}
          </Text>
        </View>
      )}
    </XStack>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Edit Profile',
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView flexShrink={1}>
        <YStack pt="$3" gap="$2" justifyContent="center" alignItems="center">
          <Avatar circular size="$10">
            <Avatar.Image accessibilityLabel={user?.username} src={user?.avatar} />
            <Avatar.Fallback backgroundColor="$gray6" />
          </Avatar>

          <Link href="/settings/avatar">
            <Button p="0" chromeless color="$blue9" fontWeight="bold">
              Edit picture or avatar
            </Button>
          </Link>
        </YStack>

        <Separator />

        <YStack gap="0" pt="$2">
          <LinkField
            label="Name"
            value={user?.display_name}
            placeholder="Your name"
            path="/settings/updateName"
            border={true}
          />
          <LinkField
            label="Username"
            value={user?.username}
            placeholder="Your username"
            path=""
            border={true}
          />
          <LinkField
            label="Pronouns"
            value={user?.pronouns.join(', ')}
            placeholder="Your pronouns"
            path=""
            border={true}
          />
          <LinkField
            label="Bio"
            value={user?.note_text ? user?.note_text.slice(0, 30) : null}
            placeholder="Your bio"
            path=""
            border={true}
          />

          <LinkField
            label="Website"
            value={user?.website}
            placeholder="Add your website"
            path=""
            border={false}
          />
        </YStack>

        <Separator />
      </ScrollView>
    </SafeAreaView>
  )
}
