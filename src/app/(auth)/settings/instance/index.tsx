import { ActivityIndicator } from 'react-native'
import { Group, ScrollView, Separator, Text, View, XStack, YStack, Button } from 'tamagui'
import { Storage } from 'src/state/cache'
import { getInstanceV1 } from 'src/lib/api'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, Link } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import FastImage from 'react-native-fast-image'
import { openBrowserAsync, prettyCount } from '../../../../utils'
import UserAvatar from 'src/components/common/UserAvatar'

export default function Screen() {
  const instance = Storage.getString('app.instance')

  const gotoPrivacyPolicy = async () => {
    await openBrowserAsync(`https://${instance}/e/privacy`)
  }

  const gotoTermsOfService = async () => {
    await openBrowserAsync(`https://${instance}/e/terms`)
  }

  const gotoHelpCenter = async () => {
    await openBrowserAsync(`https://${instance}/site/help`)
  }

  const { data, isPending, error } = useQuery({
    queryKey: ['getInstanceV1'],
    queryFn: getInstanceV1,
  })

  if (isPending) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Loading',
            headerBackTitle: 'Back',
          }}
        />
        <View flexGrow={1} mt="$5">
          <ActivityIndicator color={'#000'} />
        </View>
      </>
    )
  }

  if (error) {
    return (
      <View flexGrow={1}>
        <Text>Error</Text>
      </View>
    )
  }

  return (
    <SafeAreaView edges={['bottom']}>
      <Stack.Screen
        options={{
          title: instance,
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView>
        <YStack gap="$3">
          <FastImage
            source={{ uri: data.thumbnail, width: '100%', height: 300 }}
            style={{ width: '100%', height: 300 }}
            resizeMode={FastImage.resizeMode.cover}
          />

          <View marginHorizontal="$3" p="$5" bg="white" borderRadius={20} marginTop={-50}>
            <Text fontSize="$7">{data.description}</Text>
          </View>

          <View marginHorizontal="$3" bg="white" borderRadius={20}>
            <Group
              orientation="horizontal"
              separator={<Separator borderColor="$gray6" vertical />}
            >
              <Group.Item>
                <YStack
                  flexGrow={1}
                  p="$5"
                  justifyContent="center"
                  alignItems="center"
                  gap="$2"
                >
                  <Text fontSize="$8">{prettyCount(data.stats.user_count)}</Text>
                  <Text color="$gray9">Total Users</Text>
                </YStack>
              </Group.Item>
              <Group.Item>
                <YStack
                  flexGrow={1}
                  p="$5"
                  justifyContent="center"
                  alignItems="center"
                  gap="$2"
                >
                  <Text fontSize="$8">{prettyCount(data.stats.status_count)}</Text>
                  <Text color="$gray9">Total Posts</Text>
                </YStack>
              </Group.Item>
            </Group>
          </View>

          <View marginHorizontal="$3" bg="white" borderRadius={20}>
            <XStack p="$5" justifyContent="space-between" alignItems="center" gap="$3">
              <Text color="$gray9">Administrator Account</Text>
              <Link href={`/profile/${data?.contact_account?.id}`}>
                <XStack alignItems="center" gap="$3">
                  <UserAvatar
                    url={data?.contact_account?.avatar}
                    width={30}
                    height={30}
                  />
                  <Text fontSize="$7">@{data?.contact_account.username}</Text>
                </XStack>
              </Link>
            </XStack>
          </View>
          <View marginHorizontal="$3" bg="white" borderRadius={20}>
            <YStack p="$5">
              <Text color="$gray9" textAlign="center">
                Server Rules
              </Text>
              {data?.rules.map((rule, idx) => {
                return (
                  <XStack key={idx} py="$3" pr="$3" gap="$3">
                    <Text fontWeight="bold" color="$gray8">
                      {rule.id}
                    </Text>
                    <Text>{rule.text}</Text>
                  </XStack>
                )
              })}
            </YStack>
          </View>

          <View marginHorizontal="$3">
            <Button
              onPress={() => gotoPrivacyPolicy()}
              bg="$blue8"
              size="$5"
              fontWeight="bold"
              color="white"
            >
              Privacy Policy
            </Button>
          </View>

          <View marginHorizontal="$3">
            <Button
              onPress={() => gotoTermsOfService()}
              bg="$blue8"
              size="$5"
              fontWeight="bold"
              color="white"
            >
              Terms of Service
            </Button>
          </View>

          <View marginHorizontal="$3">
            <Button
              onPress={() => gotoHelpCenter()}
              bg="$blue8"
              size="$5"
              fontWeight="bold"
              color="white"
            >
              Help Center
            </Button>
          </View>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
