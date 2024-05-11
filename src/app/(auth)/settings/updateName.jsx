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
  Input,
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
  const [name, setName] = useState(user.display_name)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Name',
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView flexGrow={1}>
        <XStack pt="$3" px="$4" justifyContent="space-between">
          <Text color="$gray8">Name</Text>

          <View alignItems="flex-end" justifyContent="flex-end">
            <Text color="$gray9">{name?.length}/30</Text>
          </View>
        </XStack>
        <Input
          value={name}
          borderLeftWidth={0}
          borderRightWidth={0}
          borderTopWidth={0}
          bg="white"
          placeholder="Add your full name, or nickname"
          p="0"
          m="0"
          size="$6"
          onChangeText={setName}
        />

        <Text pl="$3" pr="$10" py="$4" color="$gray9">
          Help people discover your account by using the name you're known by: either your
          full name, nickname or business name.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}
