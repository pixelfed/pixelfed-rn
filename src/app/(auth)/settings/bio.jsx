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
  TextArea,
} from 'tamagui'
import ProfileHeader from '@components/profile/ProfileHeader'
import { Storage } from 'src/state/cache'
import { queryApi } from 'src/requests'
import { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, Link } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useQuery, useInfiniteQuery, useMutation } from '@tanstack/react-query'
import {
  getAccountById,
  getAccountStatusesById,
  getConfig,
  updateCredentials,
} from 'src/lib/api'
import { router } from 'expo-router'

export default function Page() {
  const userCache = JSON.parse(Storage.getString('user.profile'))

  const { data: config } = useQuery({
    queryKey: ['getConfig'],
    queryFn: getConfig,
  })

  const { data: user } = useQuery({
    queryKey: ['profileById', userCache.id],
    queryFn: getAccountById,
  })
  const [bio, setBio] = useState(user.note_text)
  const [isSubmitting, setSubmitting] = useState(false)

  const mutation = useMutation({
    mutationFn: async (data) => {
      setSubmitting(true)
      return await updateCredentials(data)
    },
    onSuccess: () => {
      router.replace('/settings/profile')
    },
  })

  const onSubmit = () => {
    mutation.mutate({ note: bio })
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Bio',
          headerBackTitle: 'Back',
          headerRight: () =>
            isSubmitting ? (
              <ActivityIndicator />
            ) : (
              <Button
                fontSize="$7"
                p="0"
                fontWeight={'600'}
                color="$blue9"
                chromeless
                onPress={() => onSubmit()}
              >
                Save
              </Button>
            ),
        }}
      />
      <ScrollView flexGrow={1}>
        <XStack py="$3" px="$4" justifyContent="space-between">
          <Text color="$gray8">Bio</Text>

          <View alignItems="flex-end" justifyContent="flex-end">
            <Text color="$gray8">
              {bio?.length}/{config?.account.max_bio_length}
            </Text>
          </View>
        </XStack>
        <TextArea
          value={bio}
          bg="white"
          placeholder="Add an optional bio"
          p="$1"
          mx="$3"
          size="$6"
          onChangeText={setBio}
        />

        <Text pl="$3" pr="$10" py="$3" color="$gray8">
          Add an optional bio to describe yourself
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}
