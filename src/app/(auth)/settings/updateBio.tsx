import { ActivityIndicator } from 'react-native'
import { ScrollView, Text, View, XStack, TextArea, Button } from 'tamagui'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack } from 'expo-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getConfig, updateCredentials } from 'src/lib/api'
import { router } from 'expo-router'
import { useQuerySelfProfile } from 'src/state/AuthProvider'

export default function Page() {
  const { data: config } = useQuery({
    queryKey: ['getConfig'],
    queryFn: getConfig,
  })

  const maxLen = config ? Math.floor(config?.account.max_bio_length) : 0

  const { user } = useQuerySelfProfile()
  const [bio, setBio] = useState(user?.note_text)
  const [isSubmitting, setSubmitting] = useState(false)

  const mutation = useMutation({
    mutationFn: async (data) => {
      setSubmitting(true)
      return await updateCredentials(data)
    },
    onSuccess: () => {
      router.back()
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
          <Text color="$gray10">Bio</Text>

          <View alignItems="flex-end" justifyContent="flex-end">
            <Text color="$gray10">
              {bio?.length}/{config?.account.max_bio_length}
            </Text>
          </View>
        </XStack>

        <TextArea
          value={bio}
          bg="white"
          placeholder="Add an optional bio"
          p="0"
          mx="$3"
          numberOfLines={8}
          maxLength={maxLen}
          size="$6"
          onChangeText={setBio}
        />

        <Text p="$3" color="$gray9">
          Add an optional bio to describe yourself. Hashtags and mentions will be linked,
          make sure you use full webfinger addresses for remote accounts
          (@pixelfed@mastodon.social)
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}
