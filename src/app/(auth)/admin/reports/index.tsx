import { Feather } from '@expo/vector-icons'
import {
  BottomSheetBackdrop,
  type BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Stack, useRouter } from 'expo-router'
import { useCallback, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, StyleSheet } from 'react-native'
import { PressableOpacity } from 'react-native-pressable-opacity'
import { SafeAreaView } from 'react-native-safe-area-context'
import ImageComponent from 'src/components/ImageComponent'
import { PixelfedBottomSheetModal } from 'src/components/common/BottomSheets'
import ReadMore from 'src/components/common/ReadMore'
import { getModReports, postReportHandle, postUserHandle } from 'src/lib/api'
import { _timeAgo, enforceLen, htmlToTextWithLineBreaks } from 'src/utils'
import { Button, Group, Separator, Text, View, XStack, YStack } from 'tamagui'

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
      if (account?.object_type === 'App\\Status') {
        return postReportHandle(update)
      }
      if (account?.object_type === 'App\\Profile') {
        return postUserHandle(update)
      }
    },
    onSuccess: () => {
      router.back()
    },
  })

  const _handleReport = (type) => {
    if (type === 'delete') {
      Alert.alert('Confirm deletion', 'Are you sure you want to delete this?', [
        { text: 'Cancel', style: 'cancel' },
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

  const RenderReportedAccount = () => (
    <YStack my="$3" alignItems="center" gap="$3">
      <Text color="$gray9">Reported account </Text>
      {activeReport?.object_type === 'App\\Status' ? (
        <PressableOpacity onPress={() => gotoProfile(activeReport?.status?.account?.id)}>
          <XStack bg="$gray4" p="$2" gap="$2" alignItems="center" borderRadius={10}>
            <ImageComponent
              source={{ uri: activeReport?.status?.account?.avatar }}
              style={{ width: 20, height: 20, borderRadius: 30 }}
            />
            <Text fontWeight={'bold'}>
              {enforceLen(activeReport?.status?.account?.acct, 15, true)}
            </Text>
          </XStack>
        </PressableOpacity>
      ) : null}

      {activeReport?.object_type === 'App\\Profile' ? (
        <PressableOpacity onPress={() => gotoProfile(activeReport?.account?.id)}>
          <XStack bg="$gray4" p="$2" gap="$2" alignItems="center" borderRadius={10}>
            <ImageComponent
              source={{ uri: activeReport?.account?.avatar }}
              style={{ width: 20, height: 20, borderRadius: 30 }}
            />
            <Text fontWeight={'bold'}>
              {enforceLen(activeReport?.account?.acct, 15, true)}
            </Text>
          </XStack>
        </PressableOpacity>
      ) : null}
    </YStack>
  )

  const RenderEmpty = () => (
    <View flex={1}>
      <Separator borderColor="#ccc" />
      <YStack flexGrow={1} justifyContent="center" alignItems="center" gap="$3">
        <Feather name="check-circle" size={40} color="#aaa" />
        <Text fontSize="$8" color="$gray9">
          No open reports!
        </Text>
      </YStack>
    </View>
  )

  const RenderItem = ({ item }) => {
    const objectType = item.object_type == 'App\\Status' ? 'post' : 'profile'
    if (objectType === 'post') {
      const reportedBy = item?.reported_by_account?.username
      const msg = `#${item.id} - ${item.type} post report`
      return (
        <PressableOpacity onPress={() => handlePresentModalPress(item)}>
          <XStack p="$5" bg="white" justifyContent="space-between" alignItems="center">
            <Text fontWeight="$6" allowFontScaling={false}>
              {msg}
            </Text>
            <Text fontWeight="$5" allowFontScaling={false} color="$gray10">
              {_timeAgo(item.created_at)}
            </Text>
          </XStack>
        </PressableOpacity>
      )
    }

    if (objectType === 'profile') {
      const reportedBy = item?.reported_by_account?.username
      const msg = `#${item.id} - ${item.type} post report`
      return (
        <PressableOpacity onPress={() => handlePresentModalPress(item)}>
          <XStack p="$5" bg="white" justifyContent="space-between" alignItems="center">
            <Text fontWeight="$6" allowFontScaling={false}>
              {msg}
            </Text>
            <Text fontWeight="$5" allowFontScaling={false} color="$gray10">
              {_timeAgo(item.created_at)}
            </Text>
          </XStack>
        </PressableOpacity>
      )
    }
  }

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['getModReports'],
    queryFn: getModReports,
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
          title: 'Reports',
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

      <PixelfedBottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView style={styles.contentContainer}>
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$6" fontWeight="bold">
              Report #{activeReport?.id}
            </Text>
            <XStack gap="$1" alignItems="center">
              <Feather name="clock" color="#aaa" />
              <Text fontWeight="bold" color="$gray9">
                {_timeAgo(activeReport?.created_at)}
              </Text>
            </XStack>
          </XStack>
          <XStack mb="$3" justifyContent="space-between" alignItems="center">
            <RenderReportedAccount />
            <YStack my="$3" alignItems="center" gap="$3">
              <Text color="$gray9">Reported by </Text>
              <PressableOpacity
                onPress={() => gotoProfile(activeReport?.reported_by_account?.id)}
              >
                <XStack bg="$gray4" p="$2" gap="$2" alignItems="center" borderRadius={10}>
                  <ImageComponent
                    source={{ uri: activeReport?.reported_by_account?.avatar }}
                    style={{ width: 20, height: 20, borderRadius: 30 }}
                  />
                  <Text fontWeight={'bold'}>
                    {enforceLen(activeReport?.reported_by_account?.acct, 15, true)}
                  </Text>
                </XStack>
              </PressableOpacity>
            </YStack>
          </XStack>
          {activeReport?.object_type === 'App\\Status' ? (
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
                  <Text>{htmlToTextWithLineBreaks(activeReport?.status.content)}</Text>
                </ReadMore>
              </View>
            </View>
          ) : null}

          <Group
            mt="$5"
            orientation="vertical"
            separator={<Separator borderColor="$gray2" />}
          >
            <Group.Item>
              <Button
                flexGrow={1}
                size="$5"
                fontWeight="bold"
                onPress={() => _handleReport('ignore')}
              >
                Ignore
              </Button>
            </Group.Item>
            {activeReport?.object_type === 'App\\Status' ? (
              <Group
                orientation="horizontal"
                separator={<Separator vertical borderColor="$gray4" />}
              >
                <Group.Item>
                  <Button
                    flexGrow={1}
                    size="$5"
                    fontWeight="bold"
                    onPress={() => _handleReport('unlist')}
                  >
                    Unlist Post
                  </Button>
                </Group.Item>
                <Group.Item>
                  <Button
                    flexGrow={1}
                    size="$5"
                    fontWeight="bold"
                    onPress={() => _handleReport('cw')}
                  >
                    Mark Sensitive
                  </Button>
                </Group.Item>
              </Group>
            ) : null}
            {activeReport?.object_type === 'App\\Profile' ? (
              <Group.Item>
                <Button
                  flexGrow={1}
                  size="$5"
                  theme="red"
                  bg="$red9"
                  color="white"
                  fontWeight="bold"
                  onPress={() => _handleReport('delete')}
                >
                  Delete Account
                </Button>
              </Group.Item>
            ) : null}
          </Group>
        </BottomSheetView>
      </PixelfedBottomSheetModal>
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
