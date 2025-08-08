import { router, Stack } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useProfileMutation } from 'src/hooks/mutations/useProfileMutation'
import { useQuerySelfProfile } from 'src/state/AuthProvider'
import { Button, Input, ScrollView, Text, useTheme, View, XStack } from 'tamagui'

export default function Page() {
  const { user } = useQuerySelfProfile()
  const [name, setName] = useState(user?.display_name || '')
  const theme = useTheme()
  const { profileMutation, isSubmitting } = useProfileMutation({
    onSuccess: () => router.replace('/profile'),
  })

  const onSubmit = () => {
    profileMutation.mutate({ display_name: name })
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background?.val.secondary.val }}
      edges={['bottom']}
    >
      <Stack.Screen
        options={{
          title: 'Name',
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
          <Text color={theme.color?.val.secondary.val}>Name</Text>

          <View alignItems="flex-end" justifyContent="flex-end">
            <Text color={theme.color?.val.tertiary.val}>{name?.length}/30</Text>
          </View>
        </XStack>
        <Input
          value={name}
          bg={theme.background?.val.tertiary.val}
          borderColor={theme.borderColor?.val.default.val}
          color={theme.color?.val.default.val}
          placeholderTextColor={theme.color?.val.tertiary.val}
          maxLength={30}
          placeholder="Add your full name, or nickname"
          p="0"
          mx="$3"
          size="$6"
          onChangeText={setName}
        />

        <Text py="$3" px="$4" color={theme.color?.val.tertiary.val}>
          Help people discover your account by using the name you're known by: either your
          full name, nickname or business name.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}
