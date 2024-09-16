import { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import {
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Alert,
  Platform,
  Keyboard,
} from 'react-native'
import { Text, View, XStack, Select, Adapt, Sheet, YStack, Separator } from 'tamagui'
import { StatusBar } from 'expo-status-bar'
import { Feather, Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, Stack } from 'expo-router'
import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  getStatusRepliesById,
  postComment,
  likeStatus,
  unlikeStatus,
  deleteStatus,
} from 'src/lib/api'
import FeedHeader from 'src/components/common/FeedHeader'
import { Storage } from 'src/state/cache'
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetFlatList,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet'
import UserAvatar from '../common/UserAvatar'
import {
  _timeAgo,
  htmlToTextWithLineBreaks,
  likeCountLabel,
  prettyCount,
} from 'src/utils'
import ReadMoreAndroid from '../common/ReadMoreAndroid'
import ReadMore from '../common/ReadMore'
import AutolinkText from '../common/AutolinkText'
import FastImage from 'react-native-fast-image'
import { Switch } from '../form/Switch'

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function CommentFeed({
  id,
  showLikes,
  user,
  handleReport,
  gotoProfile,
  gotoUsernameProfile,
  gotoHashtag,
}) {
  const [commentText, setComment] = useState()
  const [inReplyToId, setInReplyToId] = useState()
  const [replySet, setReply] = useState()
  const [replyScope, setReplyScope] = useState('public')
  const [hasCW, setCW] = useState(false)
  const [fetchingChildren, setFetchingChildren] = useState(false)
  const queryClient = useQueryClient()
  const commentRef = useRef()

  const handlePost = (nativeEvent) => {
    commentMutation.mutate({
      postId: inReplyToId ? inReplyToId : id,
      commentText: commentText,
    })
    setComment()
    setInReplyToId()
    setReply()
  }

  const handleReplyPost = (nativeEvent) => {
    commentMutation.mutate({ postId: inReplyToId ? inReplyToId : id, commentText: commentText, scope: replyScope, cw: hasCW })
    setComment()
    setInReplyToId()
    setReply()
  }

  const handleShowLikes = (id) => {
    showLikes(id)
  }

  const handleCommentLike = (item) => {
    if (item.favourited) {
      likeMutation.mutate({ id: item.id, type: 'unlike' })
      return
    }
    likeMutation.mutate({ id: item.id, type: 'like' })
  }

  const handleCommentReport = (id) => {
    handleReport(id)
  }

  const toggleScope = () => {
    switch (replyScope) {
      case 'public':
        setReplyScope('unlisted')
        break;

      case 'unlisted':
        setReplyScope('private')
        break;

      case 'private':
        setReplyScope('public')
        break;
    }
  }

  const handleCommentDelete = (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete your comment?', [
      {
        text: 'Cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => commentDeleteMutation({ id: id }),
      },
    ])
  }

  const handleReplyTo = (item) => {
    commentRef?.current.focus()
    if (item && item?.id && item?.account?.id) {
      setReply({
        id: item.id,
        username: item.account.username,
        content: item.content_text && item.content_text.slice(8, 55) + '...',
        acct: item.account.acct,
      })
      setInReplyToId(item.id)
      setComment('@' + item.account.acct + ' ')
    }
  }

  const clearReply = () => {
    setReply()
    setInReplyToId()
    setComment()
    commentRef?.current.blur()
    Keyboard.dismiss()
  }

  const fetchChildren = (id) => {
    setFetchingChildren(id)
    setTimeout(() => setFetchingChildren(), 1000)
  }

  const renderItem = useCallback(
    ({ item }) => {
      const captionText = htmlToTextWithLineBreaks(item.content)
      const postType = item.pf_type
      return (
        <View style={styles.itemContainer}>
          <YStack flexShrink={1}>
            <XStack flexShrink={1}>
              <XStack gap="$3" flexGrow={1}>
                <Pressable onPress={() => gotoProfile(item.account.id)}>
                  <UserAvatar url={item.account.avatar} width={30} height={30} />
                </Pressable>

                <YStack flexGrow={1} maxWidth={SCREEN_WIDTH - 150} gap={4}>
                  <XStack gap="$2">
                    <Pressable onPress={() => gotoProfile(item?.account.id)}>
                      <Text fontSize="$3" fontWeight="bold">
                        {item.account.acct}
                      </Text>
                    </Pressable>
                    <Text fontSize="$3" color="$gray9">
                      {_timeAgo(item.created_at)}
                    </Text>
                  </XStack>
                  {postType === 'photo' ? (
                    <FastImage
                      source={{
                        uri: item?.media_attachments[0].url,
                        width: 200,
                        height: 200,
                      }}
                      style={{ width: 200, height: 200, borderRadius: 10 }}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  ) : null}
                  {Platform.OS === 'ios' ? (
                    <ReadMore numberOfLines={3} renderRevealedFooter={() => <></>}>
                      <AutolinkText
                        text={captionText}
                        onMentionPress={gotoUsernameProfile}
                        onHashtagPress={gotoHashtag}
                        onUsernamePress={gotoUsernameProfile}
                      />
                    </ReadMore>
                  ) : (
                    <ReadMoreAndroid numberOfLines={3} renderRevealedFooter={() => <></>}>
                      <AutolinkText
                        text={captionText}
                        onMentionPress={gotoUsernameProfile}
                        onHashtagPress={gotoHashtag}
                        onUsernamePress={gotoUsernameProfile}
                      />
                    </ReadMoreAndroid>
                  )}
                  <XStack mt="$2" gap="$4">
                    <Pressable onPress={() => handleReplyTo(item)}>
                      <Text fontWeight="bold" fontSize="$3" color="$gray9">
                        Reply
                      </Text>
                    </Pressable>
                    {item.favourites_count ? (
                      <Pressable onPress={() => handleShowLikes(item.id)}>
                        <Text fontSize="$3" color="$gray9">
                          {likeCountLabel(item?.favourites_count)}
                        </Text>
                      </Pressable>
                    ) : null}
                    {item.account.id != user?.id ? (
                      <Pressable onPress={() => handleCommentReport(item?.id)}>
                        <Text fontSize="$3" color="$gray9">
                          Report
                        </Text>
                      </Pressable>
                    ) : (
                      <Pressable onPress={() => handleCommentDelete(item.id)}>
                        <Text fontSize="$3" color="$gray9">
                          Delete
                        </Text>
                      </Pressable>
                    )}
                  </XStack>
                  {item.reply_count ? (
                    <YStack mt="$3">
                      { fetchingChildren && fetchingChildren == item.id ? (
                        <XStack gap="$2" alignItems='center'>
                          <View w={20} h={1} bg="$gray8"></View>
                          <ActivityIndicator />
                        </XStack> ) : (
                          <Pressable onPress={() => fetchChildren(item.id)}>
                            <XStack gap="$2" alignItems='center'>
                              <View w={20} h={1} bg="$gray8"></View>
                              <Text fontSize="$3" color="$gray9" fontWeight="bold">View {item.reply_count} {item.reply_count == 1 ? 'reply' : 'more replies'}</Text>
                            </XStack>
                          </Pressable>
                        )
                    }
                    </YStack>
                  ) : null}
                </YStack>
              </XStack>
              <Pressable onPress={() => handleCommentLike(item)}>
                <YStack justifyContent="center" alignItems="center" gap="$1">
                  {item.favourited ? (
                    <Ionicons name="heart" color="red" size={20} />
                  ) : (
                    <Ionicons name="heart-outline" color="black" size={20} />
                  )}
                  {item.favourites_count ? (
                    <Text fontSize="$3">{prettyCount(item.favourites_count)}</Text>
                  ) : null}
                </YStack>
              </Pressable>
            </XStack>
          </YStack>
        </View>
      )
    },
    [gotoUsernameProfile, gotoHashtag, fetchingChildren]
  )

  const renderComment = useCallback(
    ({ item }) => {
      const captionText = htmlToTextWithLineBreaks(item.content)
      const postType = item.pf_type
      return (
        <View style={styles.itemContainer}>
          <YStack flexShrink={1}>
            <XStack flexShrink={1}>
              <XStack gap="$3" flexGrow={1}>
                <Pressable onPress={() => gotoProfile(item.account.id)}>
                  <UserAvatar url={item.account.avatar} width={30} height={30} />
                </Pressable>

                <YStack flexGrow={1} maxWidth={SCREEN_WIDTH - 150} gap={4}>
                  <XStack gap="$2">
                    <Pressable onPress={() => gotoProfile(item?.account.id)}>
                      <Text fontSize="$3" fontWeight="bold">
                        {item.account.acct}
                      </Text>
                    </Pressable>
                    <Text fontSize="$3" color="$gray9">
                      {_timeAgo(item.created_at)}
                    </Text>
                  </XStack>
                  {postType === 'photo' ? (
                    <FastImage
                      source={{
                        uri: item?.media_attachments[0].url,
                        width: 200,
                        height: 200,
                      }}
                      style={{ width: 200, height: 200, borderRadius: 10 }}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  ) : null}
                  {Platform.OS === 'ios' ? (
                    <ReadMore numberOfLines={3} renderRevealedFooter={() => <></>}>
                      <AutolinkText
                        text={captionText}
                        onMentionPress={gotoUsernameProfile}
                        onHashtagPress={gotoHashtag}
                        onUsernamePress={gotoUsernameProfile}
                      />
                    </ReadMore>
                  ) : (
                    <ReadMoreAndroid numberOfLines={3} renderRevealedFooter={() => <></>}>
                      <AutolinkText
                        text={captionText}
                        onMentionPress={gotoUsernameProfile}
                        onHashtagPress={gotoHashtag}
                        onUsernamePress={gotoUsernameProfile}
                      />
                    </ReadMoreAndroid>
                  )}
                  <XStack mt="$2" gap="$4">
                    <Pressable onPress={() => handleReplyTo(item)}>
                      <Text fontWeight="bold" fontSize="$3" color="$gray9">
                        Reply
                      </Text>
                    </Pressable>
                    {item.favourites_count ? (
                      <Pressable onPress={() => handleShowLikes(item.id)}>
                        <Text fontSize="$3" color="$gray9">
                          {likeCountLabel(item?.favourites_count)}
                        </Text>
                      </Pressable>
                    ) : null}
                    {item.account.id != user?.id ? (
                      <Pressable onPress={() => handleCommentReport(item?.id)}>
                        <Text fontSize="$3" color="$gray9">
                          Report
                        </Text>
                      </Pressable>
                    ) : (
                      <Pressable onPress={() => handleCommentDelete(item.id)}>
                        <Text fontSize="$3" color="$gray9">
                          Delete
                        </Text>
                      </Pressable>
                    )}
                  </XStack>
                </YStack>
              </XStack>
              <Pressable onPress={() => handleCommentLike(item)}>
                <YStack justifyContent="center" alignItems="center" gap="$1">
                  {item.favourited ? (
                    <Ionicons name="heart" color="red" size={20} />
                  ) : (
                    <Ionicons name="heart-outline" color="black" size={20} />
                  )}
                  {item.favourites_count ? (
                    <Text fontSize="$3">{prettyCount(item.favourites_count)}</Text>
                  ) : null}
                </YStack>
              </Pressable>
            </XStack>
          </YStack>
        </View>
      )
    },
    [gotoUsernameProfile, gotoHashtag]
  )

  const RenderHeader = useCallback(() => {
    return (
      <YStack mt="$1" mb="$3">
        <XStack pb="$4" justifyContent="center">
          <Text fontSize="$7" fontWeight={'bold'}>
            Comments
          </Text>
        </XStack>
        <Separator borderColor="$gray5" />
      </YStack>
    )
  }, [])

  const RenderEmpty = useCallback(() => {
    return (
      <View flexGrow={1} justifyContent="center" alignItems="center">
        <YStack justifyContent="center" alignItems="center" gap="$3">
          <Text fontSize="$9" fontWeight="bold">
            No comments yet
          </Text>
          <Text fontSize="$6" color="$gray9">
            Start the conversation
          </Text>
        </YStack>
      </View>
    )
  })

  const commentMutation = useMutation({
    mutationFn: (newComment) => {
      return postComment(newComment)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getStatusRepliesById'] })
    },
  })

  const likeMutation = useMutation({
    mutationFn: (handleLike) => {
      return handleLike.type === 'like'
        ? likeStatus(handleLike)
        : unlikeStatus(handleLike)
    },
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['getStatusRepliesById'] })
      }, 500)
    },
  })

  const { isPending, mutate: commentDeleteMutation } = useMutation({
    mutationFn: (commentDelete) => {
      return deleteStatus(commentDelete)
    },
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['getStatusRepliesById'] })
      }, 1500)
    },
  })

  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetching,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['getStatusRepliesById', id],
    initialPageParam: null,
    refetchOnWindowFocus: false,
    queryFn: async ({ pageParam }) => {
      const data = await getStatusRepliesById(id, 0)
      return data
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (lastPage) => lastPage.prevPage,
  })

  if (isFetching && !isFetchingNextPage) {
    return (
      <View flexGrow={1} mt="$5">
        <ActivityIndicator color={'#000'} />
      </View>
    )
  }

  if (isError && error) {
    return (
      <View flexGrow={1}>
        <Text>Error</Text>
      </View>
    )
  }
  return (
    <View style={{flexGrow: 1}}>
      <BottomSheetFlatList
        data={data?.pages.flatMap((page) => page.data)}
        keyExtractor={(i) => i?.id}
        renderItem={renderItem}
        ListHeaderComponent={RenderHeader}
        ListEmptyComponent={RenderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentCommentsContainer}
      />
      {inReplyToId && replySet ? (
        <View px="$4">
          <XStack justifyContent="space-between">
            <YStack>
              <Text color="$gray8">
                @
                <Text fontWeight={'600'} fontFamily={'system'} color="$gray8">
                  {replySet.acct}
                </Text>
              </Text>
              <Text color="$gray11">{replySet.content}</Text>
            </YStack>
            <Text color="$gray8" onPress={() => clearReply()}>
              Clear
            </Text>
          </XStack>
        </View>
      ) : null}
      <YStack style={styles.inputGroup}>
        <BottomSheetTextInput
          ref={commentRef}
          style={styles.input}
          value={commentText}
          onChangeText={setComment}
          // returnKeyType="send"
          multiline={true}
          maxLength={500}
          // returnKeyLabel="Post"
          // onSubmitEditing={handlePost}
          placeholder="Add a comment..."
        />
        <XStack
          px="$5"
          pb="$4"
          mt={-25}
          justifyContent="space-between"
          alignItems="center"
        >
          <XStack>
            <Text allowFontScaling={false} fontWeight="bold" fontSize={12} color="$gray9">
              {commentText && commentText.length ? commentText.length : 0}
            </Text>
            <Text allowFontScaling={false} fontWeight="bold" fontSize={12} color="$gray9">
              /
            </Text>
            <Text allowFontScaling={false} fontWeight="bold" fontSize={12} color="$gray9">
              500
            </Text>
          </XStack>
          <XStack alignItems="center" gap={5}>
            <Pressable onPress={() => toggleScope()}>
              <Text allowFontScaling={false} color="$gray10" fontWeight="bold" fontSize={12} textTransform='uppercase'>
                { replyScope }
              </Text>
            </Pressable>
            <Feather name={ replyScope === 'public' ? "globe" : (replyScope === 'private' ? 'lock' : 'eye-off')} color="#ccc" />
          </XStack>
          <XStack alignItems="center" gap={5}>
            <Text allowFontScaling={false} fontSize={12} color="#ccc" fontWeight={'bold'}>
              CW
            </Text>
            <Switch width={40} height={20} defaultChecked={hasCW} onCheckedChange={(checked) => setCW(checked)}>
              <Switch.Thumb width={20} height={20} animation="quicker" />
            </Switch>
          </XStack>
          <Text
            allowFontScaling={false}
            color="$blue9"
            fontWeight="bold"
            letterSpacing={-0.41}
            onPress={() => handleReplyPost()}
          >
            POST
          </Text>
        </XStack>
      </YStack>
    </View>
  )
}
const styles = StyleSheet.create({
  contentCommentsContainer: {
    backgroundColor: 'white',
  },
  itemContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    padding: 15,
    marginBottom: 0,
    backgroundColor: '#fff',
  },
  inputGroup: {
    minHeight: 100,
    maxHeight: 150,
  },
  input: {
    minHeight: 50,
    maxHeight: 150,
    marginTop: 5,
    marginHorizontal: 15,
    marginBottom: 30,
    borderRadius: 10,
    fontSize: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(151, 151, 151, 0.25)',
    backgroundColor: 'rgba(151, 151, 151, 0.05)',
  },
  footerContainer: {
    padding: 12,
    margin: 12,
    borderRadius: 12,
    backgroundColor: '#80f',
  },
  footerText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '800',
  },
})
