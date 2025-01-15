import { Stack, useRouter, Link } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  Group,
  ScrollView,
  Separator,
  Text,
  View,
  XStack,
  YStack,
  Button,
} from 'tamagui'
import { Feather } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { getAdminStats } from 'src/lib/api'
import { useUserCache } from 'src/state/AuthProvider'

export default function Page() {
  const router = useRouter()
  const userJson = useUserCache()

  if (!userJson.is_admin) {
    router.back()
  }

  const getTimeBasedGreeting = () => {
    const userName = userJson.username
    const currentHour = new Date().getHours()

    if (currentHour < 12) {
      return `Good morning sunshine! ☀️`
    }
    if (currentHour < 18) {
      return `Good afternoon, ${userName}!`
    }
    return `Good evening, ${userName}, hope you had a great day!`
  }

  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: getAdminStats,
  })

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left']}>
      <Stack.Screen
        options={{
          title: 'Admin',
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <YStack p="$5" gap="$5">
          <Text fontSize="$7" fontWeight="300" fontFamily="system" color="$gray9">
            {getTimeBasedGreeting()}
          </Text>
          <Group orientation="vertical" separator={<Separator borderColor="$gray2" />}>
            <GroupButton
              icon="alert-triangle"
              title="Autospam"
              count={Math.floor(stats?.autospam_count)}
              countDanger={true}
              path="/admin/autospam/"
            />
            <GroupButton
              icon="alert-triangle"
              title="Mod Reports"
              count={Math.floor(stats?.reports)}
              countDanger={true}
              path="/admin/reports/"
            />
            {/* <GroupButton
              icon="message-circle"
              title="Admin Inbox"
              count={stats?.contact}
              countDanger={true}
              path="/settings/profile"
            /> */}
            {/* <GroupButton
              icon="list"
              title="ModLog"
              count={3}
              countDanger={true}
              path="/admin/instances"
            /> */}
          </Group>

          <Group orientation="vertical" separator={<Separator borderColor="$gray2" />}>
            <GroupButton
              icon="server"
              title="Instances"
              count={stats?.instances}
              path="/admin/instances"
            />
            {/* <GroupButton
              icon="image"
              title="Posts"
              count={stats?.statuses}
              path="/settings/profile"
            />
            <GroupButton
              icon="user"
              title="Profiles"
              count={stats?.profiles}
              path="/settings/profile"
            /> */}
            <GroupButton
              icon="user"
              title="Local Users"
              count={stats?.users}
              path="/admin/users"
            />
            {/* <GroupButton icon="plus" title="Show all" path="/settings/profile" /> */}
          </Group>

          <Group orientation="vertical" separator={<Separator borderColor="$gray2" />}>
            {/* <GroupButton icon="shield" title="Roles" path="/admin/instances" /> */}
            <GroupButton
              icon="server"
              title="Server Configuration"
              path="/admin/config"
            />
          </Group>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}

type GroupButtonProps = {
 icon: React.ComponentProps<typeof Feather>['name'],
 title: string,
 path: string,
 count?: number,
 countDanger?: boolean 
}

function GroupButton({ icon, title, path, count, countDanger }: GroupButtonProps){
  return <Group.Item>
    <Link href={path} asChild>
      <Button bg="$gray1" justifyContent="flex-start" size="$5" px="$3">
        <XStack flexGrow={1} justifyContent="space-between" alignItems="center">
          <XStack alignItems="center" ml="$1" gap="$3">
            <Feather name={icon} size={17} color="#ccc" />
            <Text fontSize="$6">{title}</Text>
            {count ? (
              <View
                bg={countDanger ? '$red9' : '$gray3'}
                px={6}
                py={4}
                borderRadius={5}
              >
                <Text fontSize="$4" color={countDanger ? '$red1' : 'black'}>
                  {count}
                </Text>
              </View>
            ) : null}
          </XStack>
          <Feather name="chevron-right" size={20} color="#ccc" />
        </XStack>
      </Button>
    </Link>
  </Group.Item>
}