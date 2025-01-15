import { FlatList, ActivityIndicator, Alert } from 'react-native'
import {
  Separator,
  Text,
  View,
  XStack,
  YStack,
} from 'tamagui'
import { Storage } from 'src/state/cache'
import { getAdminConfig, updateAdminConfig } from 'src/lib/api'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack } from 'expo-router'
import { Switch } from 'src/components/form/Switch'
import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
  useMutation,
} from '@tanstack/react-query'

export default function Screen() {
  const instance = Storage.getString('app.instance')
  const queryClient = useQueryClient()

  const _handleUpdate = (item, key, value) => {
    const msg = (value ? 'enable' : 'disable') + ` ${item.name}`
    Alert.alert('Confirm', 'Are you sure you want to ' + msg, [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => queryClient.invalidateQueries({ queryKey: ['getAdminConfig'] }),
      },
      {
        text: 'Confirm',
        style: 'destructive',
        onPress: () => mutation.mutate({ key: key, value: value }),
      },
    ])
  }

  const RenderItem = ({ item }) => {
    return (
      <XStack py="$3" px="$4" bg="white" justifyContent="space-between">
        <YStack maxWidth="60%" gap="$2">
          <Text fontSize="$5" fontWeight={'bold'}>
            {item.name}
          </Text>
          <Text fontSize="$3" color="$gray9">
            {item.description}
          </Text>
        </YStack>
        <Switch
          size="$3"
          defaultChecked={item.state}
          onCheckedChange={(checked) => _handleUpdate(item, item.key, checked)}
        >
          <Switch.Thumb animation="quicker" />
        </Switch>
      </XStack>
    )
  }

  const mutation = useMutation({
    mutationFn: (params) => {
      return updateAdminConfig(params)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getAdminConfig'] })
    },
  })

  const { data, status, error } = useQuery({
    queryKey: ['getAdminConfig'],
    queryFn: getAdminConfig,
  })

  if (status === 'pending') {
    return <ActivityIndicator />
  }

  if (status === 'error') {
    return <Text>{error.message}</Text>
  }

  return (
    <SafeAreaView flex={1} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Server Config',
          headerBackTitle: 'Back',
        }}
      />
      <View bg="$blue9" justifyContent="center" alignItems="center" p="$4">
        <Text fontSize="$5" color="white" fontWeight="bold" allowFontScaling={false}>
          {instance}
        </Text>
      </View>
      <FlatList
        data={data}
        extraData={data}
        renderItem={RenderItem}
        ItemSeparatorComponent={<Separator />}
      />
    </SafeAreaView>
  )
}
