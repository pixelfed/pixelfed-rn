import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { ActivityIndicator, Alert, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Switch } from 'src/components/form/Switch'
import { getAdminConfig, updateAdminConfig } from 'src/lib/api'
import { Storage } from 'src/state/cache'
import { Separator, Text, View, XStack, YStack } from 'tamagui'

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
    <SafeAreaView edges={['bottom']}>
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
        ItemSeparatorComponent={Separator}
      />
    </SafeAreaView>
  )
}
