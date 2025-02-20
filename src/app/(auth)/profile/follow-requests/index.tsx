import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, Stack } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Alert, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import UserAvatar from 'src/components/common/UserAvatar'
import { Switch } from 'src/components/form/Switch'
import {
  accountFollowRequestAccept,
  accountFollowRequestReject,
  getFollowRequests,
} from 'src/lib/api'
import { enforceLen } from 'src/utils'
import { Button, Text, View, XStack, YStack } from 'tamagui'

export default function FollowersScreen() {
  const queryClient = useQueryClient()
  const [showAlert, setAlert] = useState(true)

  const RenderItem = ({ item }) => {
    return (
      <View p="$3" bg="white">
        <XStack gap="$3" justifyContent="space-between" alignItems="center">
          <XStack width="60%" gap="$3" alignItems="center">
            <Link href={`/profile/${item.id}`}>
              <UserAvatar url={item.avatar} width={40} height={40} />
            </Link>
            <YStack flexShrink={1}>
              <Text fontSize="$3" color="$gray10">
                {item.display_name}
              </Text>
              <Text fontSize="$5" fontWeight="bold" flexWrap="wrap">
                @{enforceLen(item.acct, 20, true, 'middle')}
              </Text>
            </YStack>
          </XStack>
          <XStack width="40%" gap="$3" alignItems="center">
            <Button
              size="$3"
              theme="red"
              onPress={() => _handleMutation('reject', item.id)}
            >
              Reject
            </Button>
            <Button
              size="$3"
              theme="blue"
              onPress={() => _handleMutation('accept', item.id)}
            >
              Approve
            </Button>
          </XStack>
        </XStack>
      </View>
    )
  }

  const RenderEmpty = () => (
    <View bg="white" py="$5" flexGrow={1} justifyContent="center" alignItems="center">
      <Text fontSize="$6">You don't have any follow requests!</Text>
    </View>
  )

  const {
    data: feed,
    error,
    isFetching,
  } = useQuery({
    queryKey: ['getFollowRequests'],
    queryFn: getFollowRequests,
  })

  const mutation = useMutation({
    mutationFn: async ({ type, id }) => {
      if (type === 'accept') {
        return await accountFollowRequestAccept(id)
      }
      return await accountFollowRequestReject(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getFollowRequests'] })
    },
  })

  const _handleMutation = (type, id) => {
    if (showAlert) {
      Alert.alert(
        `Confirm ${type == 'accept' ? 'Accept' : 'Rejection'}`,
        `Are you sure you want to ${type == 'accept' ? 'accept' : 'reject'} this follow application?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: type === 'accept' ? 'Accept' : 'Reject',
            style: 'destructive',
            onPress: () => mutation.mutate({ type: type, id: id }),
          },
        ]
      )
      return
    }
    mutation.mutate({ type: type, id: id })
  }

  const ItemSeparator = () => <View h={1} bg="$gray5"></View>

  if (isFetching) {
    return (
      <View flexGrow={1} mt="$5">
        <ActivityIndicator color={'#000'} />
      </View>
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
    <SafeAreaView flex={1} edges={['left']}>
      <Stack.Screen
        options={{
          title: 'Follow Requests',
          headerBackTitle: 'Back',
        }}
      />
      <XStack justifyContent="space-between" alignItems="center" p="$3">
        <Text>Show alert</Text>
        <Switch
          size="$2"
          defaultChecked={showAlert}
          onCheckedChange={(checked) => setAlert(checked)}
        >
          <Switch.Thumb animation="quicker" />
        </Switch>
      </XStack>
      <FlatList
        data={feed}
        renderItem={RenderItem}
        keyExtractor={(item, index) => item.id.toString()}
        ItemSeparatorComponent={ItemSeparator}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={RenderEmpty}
        ListFooterComponent={() => (isFetching ? <ActivityIndicator /> : null)}
      />
    </SafeAreaView>
  )
}
