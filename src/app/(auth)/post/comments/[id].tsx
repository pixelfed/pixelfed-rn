import { Feather, Ionicons } from '@expo/vector-icons'
import { BottomSheetBackdrop, type BottomSheetModal } from '@gorhom/bottom-sheet'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { Stack, router, useLocalSearchParams, useNavigation } from 'expo-router'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
//@ts-check
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PixelfedBottomSheetModal } from 'src/components/common/BottomSheets'
import { Switch } from 'src/components/form/Switch'
import CommentItem from 'src/components/post/CommentItem'
import FeedPost from 'src/components/post/FeedPost'
import {
  deleteStatus,
  deleteStatusV1,
  getStatusById,
  getStatusRepliesById,
  likeStatus,
  postComment,
  reblogStatus,
  unlikeStatus,
  unreblogStatus,
} from 'src/lib/api'
import { useUserCache } from 'src/state/AuthProvider'
import { ScrollView, Text, View, XStack, YStack } from 'tamagui'

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const navigation = useNavigation()
  const [commentText, setComment] = useState('')
  const [inReplyToId, setInReplyToId] = useState(null)
  const [replySet, setReply] = useState()
  const [replyScope, setReplyScope] = useState('public')
  const [hasCW, setCW] = useState(false)
  const [loadingChildId, setLoadingChildId] = useState(null)
  const [childComments, setChildComments] = useState({})
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const commentRef = useRef(null)
  const flatListRef = useRef(null)
  const user = useUserCache()
  const queryClient = useQueryClient()

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Loading', headerBackTitle: 'Back' })
  }, [navigation])

  const handleGotoProfile = (id: string) => {
    router.push(`/profile/${id}`)
  }

  const handleGotoHashtag = (id: string) => {
    router.push(`/hashtag/${id}`)
  }

  const handleGotoUsernameProfile = (id: string) => {
    router.push(`/profile/0?byUsername=${id.slice(1)}`)
  }

  const handleShowLikes = (id: string) => {
    router.push(`/post/likes/${id}`)
  }

  const handleCommentReport = (id: string) => {
    router.push(`/post/report/${id}`)
  }

  const gotoProfile = (id: string) => {
    router.push(`/profile/${id}`)
  }

  useLayoutEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true)

      if (flatListRef.current) {
        setTimeout(() => {
          flatListRef.current.scrollToEnd({ animated: true })
        }, 100)
      }
    })

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false)
    })

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

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
    Keyboard.dismiss()
  }

  const handleCommentLike = (item) => {
    likeMutation.mutate({
      id: item.id,
      type: item.favourited ? 'unlike' : 'like',
    })
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

  const handleCommentDelete = (id) => {
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

  const clearReply = () => {
    setReply()
    setInReplyToId(null)
    setComment('')
    commentRef.current?.blur()
    Keyboard.dismiss()
  }

  const fetchChildren = async (parentId, level) => {
    if (level >= 3) {
      router.push(`/post/comments/${parentId}`)
      return
    }
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
        gotoUsernameProfile={handleGotoUsernameProfile}
        gotoHashtag={handleGotoHashtag}
        user={user}
        childComments={childComments}
        loadingChildId={loadingChildId}
      />
    ),
    [childComments, loadingChildId, user]
  )

  const RenderEmpty = useCallback(
    () => (
      <YStack h="100%" justifyContent="center" alignItems="center" gap="$3">
        <Text fontSize="$9" fontWeight="bold">
          No comments yet
        </Text>
        <Text fontSize="$6" color="$gray9">
          Start the conversation
        </Text>
      </YStack>
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
    mutationFn: async ({ id, type }) => {
      const res = type === 'like' ? await likeStatus({ id }) : await unlikeStatus({ id })
      return { res, id, type }
    },
    onSuccess: ({ res, id, type }) => {
      let isIdChildren = true
      queryClient.setQueriesData({ queryKey: ['getStatusRepliesById'] }, (old) => {
        if (!old?.pages) return old
        const newPages = old.pages.map((page) => {
          const newData = page.data.map((post) => {
            if (post.id !== id) return post
            isIdChildren = false
            post.favourited = res.favourited
            post.favourites_count = res.favourites_count
            post.liked_by = res.liked_by
            return post
          })
          return { ...page, data: newData }
        })
        return { ...old, pages: newPages }
      })

      if (isIdChildren) {
        let oldChildrenData = childComments
        for (const [key, value] of Object.entries(oldChildrenData)) {
          const newValue = value.map((childValue) => {
            if (childValue.id === id) {
              childValue.favourited = res.favourited
              childValue.favourites_count = res.favourites_count
              childValue.liked_by = res.liked_by
            }
            return childValue
          })
          oldChildrenData[key] = newValue
        }
        setChildComments(oldChildrenData)
      }
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

  const inputContainerHeight = inReplyToId && replySet ? 150 : 110

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#fff' }}
      edges={['left', 'right', 'bottom']}
    >
      <Stack.Screen
        options={{
          title: 'Comments',
          headerBackTitle: 'Back',
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={data?.pages.flatMap((page) => page.data)}
            keyExtractor={(i) => i?.id}
            renderItem={renderItem}
            ListEmptyComponent={RenderEmpty}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentCommentsContainer}
            ListFooterComponent={<View style={{ height: inputContainerHeight }} />}
          />
        </View>

        <View style={[styles.fixedInputContainer, { height: inputContainerHeight }]}>
          {inReplyToId && replySet ? (
            <View px="$4" style={styles.replyContainer}>
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
                <Text color="$gray8" onPress={clearReply}>
                  Clear
                </Text>
              </XStack>
            </View>
          ) : null}

          <YStack style={styles.inputGroup}>
            <TextInput
              ref={commentRef}
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
                <Text
                  allowFontScaling={false}
                  fontWeight="bold"
                  fontSize={12}
                  color="$gray9"
                >
                  {commentText.length}
                </Text>
                <Text
                  allowFontScaling={false}
                  fontWeight="bold"
                  fontSize={12}
                  color="$gray9"
                >
                  /
                </Text>
                <Text
                  allowFontScaling={false}
                  fontWeight="bold"
                  fontSize={12}
                  color="$gray9"
                >
                  500
                </Text>
              </XStack>
              <XStack alignItems="center" gap={5}>
                <Pressable onPress={toggleScope}>
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
                <Text
                  allowFontScaling={false}
                  fontSize={12}
                  color="#ccc"
                  fontWeight="bold"
                >
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
              <Pressable onPress={handleReplyPost}>
                <Text
                  allowFontScaling={false}
                  color="$blue9"
                  fontWeight="bold"
                  letterSpacing={-0.41}
                >
                  POST
                </Text>
              </Pressable>
            </XStack>
          </YStack>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentCommentsContainer: {
    flexGrow: 1,
    backgroundColor: 'white',
    paddingBottom: 20,
  },
  itemContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    padding: 15,
    marginBottom: 0,
    backgroundColor: '#fff',
  },
  fixedInputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  replyContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  inputGroup: {
    padding: 10,
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
