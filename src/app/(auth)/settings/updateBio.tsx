import { useQuery } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useProfileMutation } from 'src/hooks/mutations/useProfileMutation'
import { getConfig } from 'src/lib/api'
import { useQuerySelfProfile } from 'src/state/AuthProvider'
import { Button, ScrollView, Text, TextArea, View, XStack, useTheme } from 'tamagui'

export default function Page() {
  const { data: config } = useQuery({
    queryKey: ['getConfig'],
    queryFn: getConfig,
  })
  const theme = useTheme()

  const maxLen = config ? Math.floor(config?.account.max_bio_length) : 0

  const { user } = useQuerySelfProfile()
  const [bio, setBio] = useState(user?.note_text || '')

  const { profileMutation, isSubmitting } = useProfileMutation({
    onSuccess: () => router.replace('/profile'),
  })

  const onSubmit = () => {
    profileMutation.mutate({ note: bio })
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background?.val.secondary.val }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Bio',
          headerBackTitle: 'Back',
          headerRight: () =>
            isSubmitting ? (
              <ActivityIndicator color={theme.color?.val.secondary.val} />
            ) : (
              <Button
                fontSize="$7"
                p="0"
                fontWeight={'600'}
                color={theme.colorHover.val.active.val}
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
          <Text color={theme.color?.val.secondary.val}>Bio</Text>

          <View alignItems="flex-end" justifyContent="flex-end">
            <Text color={theme.color?.val.tertiary.val}>
              {bio?.length}/{config?.account.max_bio_length}
            </Text>
          </View>
        </XStack>

        <TextArea
          value={bio}
          bg={theme.background?.val.tertiary.val}
          borderColor={theme.borderColor?.val.default.val}
          color={theme.color?.val.default.val}
          placeholderTextColor={theme.color?.val.tertiary.val}
          placeholder="Add an optional bio"
          p="0"
          mx="$3"
          numberOfLines={7}
          maxLength={maxLen}
          size="$6"
          onChangeText={setBio}
        />

        <Text p="$3" color={theme.color?.val.tertiary.val}>
          Add an optional bio to describe yourself. Hashtags and mentions will be linked,
          make sure you use full webfinger addresses for remote accounts
          like @pixelfed@mastodon.social
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}
