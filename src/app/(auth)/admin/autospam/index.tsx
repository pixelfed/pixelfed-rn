import { Stack, useRouter } from 'expo-router'
import { ActivityIndicator, Alert, FlatList, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Separator, Text, XStack, YStack, View, Group, Button } from 'tamagui'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getAutospamReports, postAutospamHandle } from 'src/lib/api'
import { _timeAgo, enforceLen, htmlToTextWithLineBreaks } from 'src/utils'
import { Feather } from '@expo/vector-icons'
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet'
import { useCallback, useMemo, useRef, useState } from 'react'
import { PressableOpacity } from 'react-native-pressable-opacity'
import FastImage from 'react-native-fast-image'
import ReadMore from 'src/components/common/ReadMore'
import UserAvatar from 'src/components/common/UserAvatar'

export default function Screen() {
  const [activeReport, setActiveReport] = useState()
  const router = useRouter()

  const bottomSheetModalRef = useRef<BottomSheetModal | null>(null)
  const snapPoints = useMemo(() => ['25%', '70%'], [])
  const handlePresentModalPress = useCallback((item) => {
    setActiveReport(item)
    bottomSheetModalRef.current?.present()
  }, [])
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} />
    ),
    []
  )

  const mutation = useMutation({
    mutationFn: (update) => {
      return postAutospamHandle(update)
    },
    onSuccess: () => {
      router.back()
    },
  })

  const _handleReport = (type) => {
    if (['delete-post', 'delete-account'].includes(type)) {
      const msg = type === 'delete-post' ? 'delete this post?' : 'delete this account?'
      Alert.alert('Confirm', 'Are you sure you want to ' + msg, [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            bottomSheetModalRef.current?.close()
            mutation.mutate({
              action: type,
              id: activeReport?.id,
            })
          },
        },
      ])
      return
    }
    bottomSheetModalRef.current?.close()
    mutation.mutate({
      action: type,
      id: activeReport?.id,
    })
  }

  const gotoProfile = (id: string) => {
    bottomSheetModalRef.current?.close()
    router.push(`/profile/${id}`)
  }

  const gotoPost = (id: string) => {
    bottomSheetModalRef.current?.close()
    router.push(`/post/${id}`)
  }

  const RenderEmpty = () => (
    <View flex={1}>
      <Separator borderColor="#ccc" />
      <YStack flexGrow={1} justifyContent="center" alignItems="center" gap="$3">
        <Feather name="check-circle" size={40} color="#aaa" />
        <Text fontSize="$8" color="$gray9">
          No open autospam reports!
        </Text>
      </YStack>
    </View>
  )

  const RenderItem = ({ item }) => {
    const msg = `#${item.id} - ${item.type}`
    return (
      <PressableOpacity onPress={() => handlePresentModalPress(item)}>
        <XStack
          px="$5"
          py="$3"
          bg="white"
          justifyContent="space-between"
          alignItems="center"
        >
          <XStack alignItems="center" gap="$1">
            <Text fontWeight="$6" allowFontScaling={false}>
              #{item.id} -{' '}
            </Text>
            <UserAvatar url={item.status.account.avatar} size="$3" />
            <Text fontSize="$6" allowFontScaling={false} fontWeight="bold">
              @{item.status.account.username}
            </Text>
          </XStack>
          <Text fontWeight="$5" allowFontScaling={false} color="$gray10">
            {_timeAgo(item.created_at)}
          </Text>
        </XStack>
      </PressableOpacity>
    )
  }

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['getAutospamReports'],
    queryFn: getAutospamReports,
  })

  if (isPending) {
    return <ActivityIndicator />
  }

  if (isError) {
    return <Text>Error: {error.message}</Text>
  }

  return (
    <SafeAreaView flex={1} edges={['left']}>
      <Stack.Screen
        options={{
          title: 'Autospam',
          headerBackTitle: 'Back',
        }}
      />

      <FlatList
        data={data}
        renderItem={RenderItem}
        contentContainerStyle={{ flex: 1 }}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={RenderEmpty}
      />

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
      >
        {activeReport ? (
          <BottomSheetView style={styles.contentContainer}>
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$6" fontWeight="bold">
                Autospam Report #{activeReport?.id}
              </Text>
              <XStack gap="$1" alignItems="center">
                <Feather name="clock" color="#aaa" />
                <Text fontWeight="bold" color="$gray9">
                  {_timeAgo(activeReport?.created_at)}
                </Text>
              </XStack>
            </XStack>
            <XStack mb="$3" justifyContent="space-between" alignItems="center">
              <YStack my="$3" alignItems="center" gap="$3">
                <Text color="$gray9">Reported account </Text>
                <PressableOpacity
                  onPress={() => gotoProfile(activeReport?.status?.account?.id)}
                >
                  <XStack
                    bg="$gray4"
                    p="$2"
                    gap="$2"
                    alignItems="center"
                    borderRadius={10}
                  >
                    <FastImage
                      source={{ uri: activeReport?.status?.account?.avatar }}
                      style={{ width: 20, height: 20, borderRadius: 30 }}
                    />
                    <Text fontWeight={'bold'}>
                      {enforceLen(activeReport?.status?.account?.acct, 15, true)}
                    </Text>
                  </XStack>
                </PressableOpacity>
              </YStack>
            </XStack>
            <View>
              <XStack justifyContent="space-between" alignItems="center" mb="$2">
                <Text color="$gray9">Reported Post</Text>
                <PressableOpacity onPress={() => gotoPost(activeReport?.status.id)}>
                  <Text color="$gray9">
                    Posted {_timeAgo(activeReport?.status.created_at)}. Tap to view
                  </Text>
                </PressableOpacity>
              </XStack>
              <View
                borderWidth={1}
                px="$5"
                py="$5"
                borderColor="$gray5"
                borderRadius={10}
              >
                <ReadMore numberOfLines={2}>
                  <Text>{htmlToTextWithLineBreaks(activeReport?.status?.content)}</Text>
                </ReadMore>
              </View>
            </View>

            <Group
              mt="$5"
              orientation="vertical"
              separator={<Separator borderColor="$gray2" />}
            >
              <Group
                orientation="horizontal"
                separator={<Separator vertical borderColor="$gray4" />}
              >
                <Group.Item>
                  <Button
                    flexGrow={1}
                    size="$5"
                    fontWeight="bold"
                    onPress={() => _handleReport('dismiss')}
                  >
                    Mark as Spam
                  </Button>
                </Group.Item>
                <Group.Item>
                  <Button
                    flexGrow={1}
                    size="$5"
                    fontWeight="bold"
                    onPress={() => _handleReport('approve')}
                  >
                    Mark as not spam
                  </Button>
                </Group.Item>
              </Group>
              <Group
                orientation="horizontal"
                separator={<Separator vertical borderColor="$gray4" />}
              >
                <Group.Item>
                  <Button
                    flexGrow={1}
                    size="$5"
                    fontWeight="bold"
                    onPress={() => _handleReport('dismiss-all')}
                  >
                    Mark all as Spam
                  </Button>
                </Group.Item>
                <Group.Item>
                  <Button
                    flexGrow={1}
                    size="$5"
                    fontWeight="bold"
                    onPress={() => _handleReport('approve-all')}
                  >
                    Mark all as not spam
                  </Button>
                </Group.Item>
              </Group>
              <Group
                orientation="horizontal"
                separator={<Separator vertical borderColor="$gray4" />}
              >
                <Group.Item>
                  <Button
                    flexGrow={1}
                    size="$5"
                    fontWeight="bold"
                    onPress={() => _handleReport('delete-post')}
                  >
                    Delete Post
                  </Button>
                </Group.Item>
                <Group.Item>
                  <Button
                    flexGrow={1}
                    size="$5"
                    fontWeight="bold"
                    onPress={() => _handleReport('delete-account')}
                  >
                    Delete Account
                  </Button>
                </Group.Item>
              </Group>
              {/* <Group.Item>
                        <Button flexGrow={1} size="$5" theme="red" fontWeight="bold">Delete Post</Button>
                    </Group.Item> */}
            </Group>
          </BottomSheetView>
        ) : null}
      </BottomSheetModal>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    margin: 20,
  },
})
