import { useCallback, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
} from 'react-native'

import { Feather, Ionicons } from '@expo/vector-icons'
import { BottomSheetFlatList, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import ImageComponent from 'src/components/ImageComponent'
import {
  deleteStatus,
  getStatusRepliesById,
  likeStatus,
  postComment,
  unlikeStatus,
} from 'src/lib/api'
import {
  _timeAgo,
  htmlToTextWithLineBreaks,
  likeCountLabel,
  prettyCount,
} from 'src/utils'
import { Separator, Text, View, XStack, YStack } from 'tamagui'
import AutolinkText from '../common/AutolinkText'
import ReadMore from '../common/ReadMore'
import { Switch } from '../form/Switch'

import type { TextInput } from 'react-native'

const SCREEN_WIDTH = Dimensions.get('screen').width

type CommentItemProps = {
  item
  level?: number
  onReply: (item) => void
  onLike: (item) => void
  onReport: (itemId: string) => void
  onDelete: (itemId: string) => void
  onShowLikes: (itemId: string) => void
  onLoadChildren: (itemId: string) => void
  gotoProfile: (accountId: string) => void
  gotoUsernameProfile: (mention: string) => void
  gotoHashtag: (hashtag: string) => void
  user
  childComments
  loadingChildId: string | null
}

const CommentItem = ({
  item,
  level = 0,
  onReply,
  onLike,
  onReport,
  onDelete,
  onShowLikes,
  onLoadChildren,
  gotoProfile,
  gotoUsernameProfile,
  gotoHashtag,
  user,
  childComments,
  loadingChildId,
}: CommentItemProps) => {
  const captionText = htmlToTextWithLineBreaks(item.content)
  const postType = item.pf_type
  const isChild = level > 0
  const hasChildren = item.reply_count > 0
  const isLoadingChildren = loadingChildId === item.id
  const childrenForComment = childComments?.[item.id] || []

  return (
    <YStack>
      <View style={[styles.itemContainer, isChild && { paddingLeft: 50 * level }]}>
        <YStack flexShrink={1}>
          <XStack flexShrink={1}>
            <XStack gap="$3" flexGrow={1}>
              <Pressable onPress={() => gotoProfile(item.account.id)}>
                <ImageComponent
                  source={{
                    uri: item.account.avatar,
                    width: level ? 15 : 30,
                    height: level ? 15 : 30,
                  }}
                  style={{
                    width: level ? 35 : 50,
                    height: level ? 35 : 50,
                    borderRadius: 40,
                  }}
                  resizeMode={'cover'}
                />
              </Pressable>

              <YStack flexGrow={1} maxWidth={SCREEN_WIDTH - (150 + level * 20)} gap={4}>
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

                {postType === 'photo' && (
                  <ImageComponent
                    source={{
                      uri: item?.media_attachments[0].url,
                      width: 200,
                      height: 200,
                    }}
                    style={{ width: 200, height: 200, borderRadius: 10 }}
                    resizeMode={'cover'}
                  />
                )}

                <ReadMore numberOfLines={3}>
                  <AutolinkText
                    text={captionText}
                    onMentionPress={gotoUsernameProfile}
                    onHashtagPress={gotoHashtag}
                  />
                </ReadMore>

                <XStack mt="$2" gap="$4">
                  <Pressable onPress={() => onReply(item)}>
                    <Text fontWeight="bold" fontSize="$3" color="$gray9">
                      Reply
                    </Text>
                  </Pressable>
                  {item.favourites_count > 0 && (
                    <Pressable onPress={() => onShowLikes(item.id)}>
                      <Text fontSize="$3" color="$gray9">
                        {likeCountLabel(item?.favourites_count)}
                      </Text>
                    </Pressable>
                  )}
                  {item.account.id !== user?.id ? (
                    <Pressable onPress={() => onReport(item.id)}>
                      <Text fontSize="$3" color="$gray9">
                        Report
                      </Text>
                    </Pressable>
                  ) : (
                    <Pressable onPress={() => onDelete(item.id)}>
                      <Text fontSize="$3" color="$gray9">
                        Delete
                      </Text>
                    </Pressable>
                  )}
                </XStack>

                {hasChildren && !childrenForComment.length && (
                  <YStack mt="$3">
                    {isLoadingChildren ? (
                      <XStack gap="$2" alignItems="center">
                        <View w={20} h={1} bg="$gray8" />
                        <ActivityIndicator />
                      </XStack>
                    ) : (
                      <Pressable onPress={() => onLoadChildren(item.id)}>
                        <XStack gap="$2" alignItems="center">
                          <View w={20} h={1} bg="$gray8" />
                          <Text fontSize="$3" color="$gray9" fontWeight="bold">
                            View {item.reply_count}{' '}
                            {item.reply_count === 1 ? 'reply' : 'replies'}
                          </Text>
                        </XStack>
                      </Pressable>
                    )}
                  </YStack>
                )}
              </YStack>
            </XStack>

            <Pressable onPress={() => onLike(item)}>
              <YStack justifyContent="center" alignItems="center" gap="$1">
                {item.favourited ? (
                  <Ionicons name="heart" color="red" size={20} />
                ) : (
                  <Ionicons name="heart-outline" color="black" size={20} />
                )}
                {item.favourites_count > 0 && (
                  <Text fontSize="$3">{prettyCount(item.favourites_count)}</Text>
                )}
              </YStack>
            </Pressable>
          </XStack>
        </YStack>
      </View>

      {childrenForComment.map((childComment) => (
        <CommentItem
          key={childComment.id}
          item={childComment}
          level={level + 1}
          onReply={onReply}
          onLike={onLike}
          onReport={onReport}
          onDelete={onDelete}
          onShowLikes={onShowLikes}
          onLoadChildren={onLoadChildren}
          gotoProfile={gotoProfile}
          gotoUsernameProfile={gotoUsernameProfile}
          gotoHashtag={gotoHashtag}
          user={user}
          childComments={childComments}
          loadingChildId={loadingChildId}
        />
      ))}
    </YStack>
  )
}

type CommentFeedProps = {
  id: string
  showLikes: (itemId: string) => void
  user
  handleReport: (itemId: string) => void
  gotoProfile: (accountId: string) => void
  gotoUsernameProfile: (mention: string) => void
  gotoHashtag: (hashtag: string) => void
}

export default function CommentFeed({
  id,
  showLikes,
  user,
  handleReport,
  gotoProfile,
  gotoUsernameProfile,
  gotoHashtag,
}: CommentFeedProps) {
  const [commentText, setComment] = useState<string>('')
  const [inReplyToId, setInReplyToId] = useState<string | null>(null)
  const [replySet, setReply] = useState()
  const [replyScope, setReplyScope] = useState('public')
  const [hasCW, setCW] = useState(false)
  const [loadingChildId, setLoadingChildId] = useState<string | null>(null)
  const [childComments, setChildComments] = useState({})
  const queryClient = useQueryClient()
  const commentRef = useRef<TextInput | null>(null)

  const handleReplyPost = () => {
    commentMutation.mutate({
      postId: inReplyToId || id,
      commentText,
      scope: replyScope,
      cw: hasCW,
    })
    setComment('')
    setInReplyToId(null)
    setReply()
  }

  const handleShowLikes = (id: string) => {
    showLikes(id)
  }

  const handleCommentLike = (item) => {
    likeMutation.mutate({
      id: item.id,
      type: item.favourited ? 'unlike' : 'like',
    })
  }

  const handleCommentReport = (id: string) => {
    handleReport(id)
  }

  const toggleScope = () => {
    setReplyScope((current) => {
      switch (current) {
        case 'public':
          return 'unlisted'
        case 'unlisted':
          return 'private'
        case 'private':
          return 'public'
        default:
          return 'public'
      }
    })
  }

  const handleCommentDelete = (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete your comment?', [
      {
        text: 'Cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => commentDeleteMutation.mutate({ id }),
      },
    ])
  }

  const handleReplyTo = (item) => {
    commentRef.current?.focus()
    if (item?.id && item?.account?.id) {
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
    setInReplyToId(null)
    setComment('')
    commentRef.current?.blur()
    Keyboard.dismiss()
  }

  const fetchChildren = async (parentId: string) => {
    setLoadingChildId(parentId)
    try {
      const childrenData = await getStatusRepliesById(parentId, 0)
      setChildComments((prev) => ({
        ...prev,
        [parentId]: childrenData.data,
      }))
    } catch (error) {
      console.error('Error fetching child comments:', error)
    } finally {
      setLoadingChildId(null)
    }
  }

  const renderItem = useCallback(
    ({ item }) => (
      <CommentItem
        item={item}
        onReply={handleReplyTo}
        onLike={handleCommentLike}
        onReport={handleCommentReport}
        onDelete={handleCommentDelete}
        onShowLikes={handleShowLikes}
        onLoadChildren={fetchChildren}
        gotoProfile={gotoProfile}
        gotoUsernameProfile={gotoUsernameProfile}
        gotoHashtag={gotoHashtag}
        user={user}
        childComments={childComments}
        loadingChildId={loadingChildId}
      />
    ),
    [childComments, loadingChildId, user]
  )

  const RenderHeader = useCallback(
    () => (
      <YStack mt="$1" mb="$3">
        <XStack pb="$4" justifyContent="center">
          <Text fontSize="$7" fontWeight="bold">
            Comments
          </Text>
        </XStack>
        <Separator borderColor="$gray5" />
      </YStack>
    ),
    []
  )

  const RenderEmpty = useCallback(
    () => (
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
    ),
    []
  )

  const commentMutation = useMutation({
    mutationFn: postComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getStatusRepliesById'] })
    },
  })

  const likeMutation = useMutation({
    mutationFn: ({ id, type }) =>
      type === 'like' ? likeStatus({ id }) : unlikeStatus({ id }),
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['getStatusRepliesById'] })
      }, 500)
    },
  })

  const commentDeleteMutation = useMutation({
    mutationFn: deleteStatus,
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['getStatusRepliesById'] })
      }, 1500)
    },
  })

  const { data, isFetchingNextPage, isFetching, isError, error } = useInfiniteQuery({
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
        <ActivityIndicator color="#000" />
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
    <View style={{ flexGrow: 1 }}>
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
                <Text fontWeight="600" fontFamily="system" color="$gray8">
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
          ref={
            commentRef as any /* BottomSheetTextInput is forwarding ref to a normal TextInput, but the typing is wrong, so we need to cast to any here */
          }
          style={styles.input}
          value={commentText}
          onChangeText={setComment}
          multiline={true}
          maxLength={500}
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
              {commentText.length}
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
              <Text
                allowFontScaling={false}
                color="$gray10"
                fontWeight="bold"
                fontSize={12}
                textTransform="uppercase"
              >
                {replyScope}
              </Text>
            </Pressable>
            <Feather
              name={
                replyScope === 'public'
                  ? 'globe'
                  : replyScope === 'private'
                    ? 'lock'
                    : 'eye-off'
              }
              color="#ccc"
            />
          </XStack>
          <XStack alignItems="center" gap={5}>
            <Text allowFontScaling={false} fontSize={12} color="#ccc" fontWeight="bold">
              CW
            </Text>
            <Switch
              width={40}
              height={20}
              defaultChecked={hasCW}
              onCheckedChange={(checked) => setCW(checked)}
            >
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
  nestedComment: {
    marginLeft: 20,
  },
  childCommentContainer: {
    borderLeftWidth: 1,
    borderLeftColor: '#eee',
    marginLeft: 15,
  },
  loadMoreReplies: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 45,
  },
  loadMoreLine: {
    width: 20,
    height: 1,
    backgroundColor: '#ccc',
    marginRight: 8,
  },
})
