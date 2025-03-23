import { Feather } from '@expo/vector-icons'
import { useMutation } from '@tanstack/react-query'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { ActivityIndicator, Alert, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { report } from 'src/lib/api'
import { reportTypes } from 'src/lib/reportTypes'
import { ScrollView, Text, XStack, YStack, useTheme } from 'tamagui'

import type { NewReport } from 'src/lib/api'
import type { ReportType } from 'src/lib/reportTypes'

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const theme = useTheme()

  const RenderOption = ({ title, name }: ReportType) => (
    <Pressable onPress={() => handleAction(name)}>
      <XStack
        px="$5"
        py="$3"
        bg={theme.background?.val.default.val}
        borderTopWidth={1}
        borderColor={theme.borderColor?.val.default.val}
        justifyContent="space-between"
        alignItems="center"
      >
        <Text fontSize="$5" color={theme.color?.val.default.val}>
          {title}
        </Text>
        <Feather name="chevron-right" size={20} color="#ccc" />
      </XStack>
    </Pressable>
  )

  const handleAction = (type: string) => {
    mutation.mutate({ object_id: id, object_type: 'post', report_type: type })
  }

  const mutation = useMutation({
    mutationFn: (newReport: NewReport) => {
      return report(newReport)
    },
    onSuccess: (data, variables, context) => {
      router.replace('/post/report/sent')
    },
    onError: (err) => {
      Alert.alert('Report Failed', err.message)
    },
  })

  return (
    <SafeAreaView edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Report Post',
          headerBackTitle: 'Back',
        }}
      />
      {mutation.isPending ? (
        <ActivityIndicator color={theme.color?.val.default.val} />
      ) : (
        <ScrollView flexGrow={1}>
          <YStack p="$5" bg={theme.background?.val.default.val} gap="$3">
            <Text fontSize="$7" fontWeight="bold" color={theme.color?.val.default.val}>
              Why are you reporting this post?
            </Text>
            <Text fontSize="$5" color={theme.color?.val.secondary.val}>
              Your report is anonymous, except if you're reporting an intellectual
              property infringement. If someone is in immediate danger, call the local
              emergency services - don't wait.
            </Text>
          </YStack>
          {reportTypes.map((r) => (
            <RenderOption key={r.name} title={r.title} name={r.name} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
