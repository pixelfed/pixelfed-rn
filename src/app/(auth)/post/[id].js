import { FlatList, Dimensions, ActivityIndicator } from 'react-native'
import { Image, ScrollView, Text, View, YStack } from 'tamagui'
import ProfileHeader from '@components/profile/ProfileHeader'
import { Storage } from 'src/state/cache'
import { queryApi } from 'src/requests'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useLocalSearchParams, router } from 'expo-router'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { getStatusById, getAccountStatusesById } from 'src/lib/api'
import FeedPost from 'src/components/post/FeedPost'
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet'
import CommentFeed from 'src/components/post/CommentFeed'

export default function Page() {
  const { id } = useLocalSearchParams()
  const user = JSON.parse(Storage.getString('user.profile'))
  const bottomSheetModalRef = useRef(null)
  const snapPoints = useMemo(() => ['45%', '70%'], [])
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} />
    ),
    []
  )
  const handleGotoProfile = (id) => {
    bottomSheetModalRef.current?.close()
    router.push(`/profile/${id}`)
  }
  const onOpenComments = useCallback((id) => {
    bottomSheetModalRef.current?.present()
  }, [])

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['getStatusById', id],
    queryFn: getStatusById,
  })

  if (isPending) {
    return (
      <View flexGrow={1} mt="$5">
        <ActivityIndicator color={'#000'} />
      </View>
    )
  }

  if (isError) {
    return <Text>Error: {error.message}</Text>
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Post',
          headerBackTitle: 'Back',
        }}
      />
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
      >
        <CommentFeed id={id} user={user} gotoProfile={handleGotoProfile} />
      </BottomSheetModal>
      <ScrollView flexShrink={1}>
        <FeedPost post={data} user={user} onOpenComments={onOpenComments} />
      </ScrollView>
    </SafeAreaView>
  )
}
