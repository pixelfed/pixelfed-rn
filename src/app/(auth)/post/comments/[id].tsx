import React from 'react';
import { Feather } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Stack, router, useLocalSearchParams, useNavigation } from 'expo-router'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
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
  Modal
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Switch } from 'src/components/form/Switch'
import CommentItem from 'src/components/post/CommentItem'
import {
  deleteStatus,
  getStatusRepliesById,
  likeStatus,
  postComment,
  unlikeStatus,
} from 'src/lib/api'
import { useUserCache } from 'src/state/AuthProvider'
import { Text, View, XStack, YStack, useTheme } from 'tamagui'

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function CommentsScreen() {
  // Hooks and Params
  const { id, username, content, acct } = useLocalSearchParams<{ id: string, username: string, content: string, acct: string }>()
  const navigation = useNavigation()
  const queryClient = useQueryClient()
  const theme = useTheme()
  const user = useUserCache()

  // Refs
  const commentRef = useRef(null)
  const flatListRef = useRef(null)

  // State
  const [commentText, setComment] = useState('')
  const [inReplyToId, setInReplyToId] = useState(null)
  const [replySet, setReply] = useState(null)
  const [replyScope, setReplyScope] = useState('public')
  const [hasCW, setCW] = useState(false)
  const [loadingChildId, setLoadingChildId] = useState(null)
  const [commentActionPending, setCommentActionPending] = useState(false);
  const [childComments, setChildComments] = useState({})
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    if (username !== undefined && content !== undefined && acct !== undefined && replySet === null) {
      setReply({
        id,
        username,
        content,
        acct,
      });
      setInReplyToId(id);
      setComment('@' + acct + ' ');
    }
  }, [username, content, acct, id, replySet, setReply, setInReplyToId, setComment]);
  useFocusEffect(
    React.useCallback(() => {
      setChildComments({})
    }, [])
  );

  // Calculate dimensions and styles
  const inputContainerHeight = inReplyToId && replySet ? 150 : 110

  // Set up navigation options
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Comments',
      headerBackTitle: 'Back',
    })
  }, [navigation])

  // Keyboard event handlers
  useLayoutEffect(() => {
    const keyboardWillShowListener =
      Platform.OS === 'ios'
        ? Keyboard.addListener('keyboardWillShow', (e) => {
          setKeyboardVisible(true)
          setKeyboardHeight(e.endCoordinates.height)
        })
        : { remove: () => { } }

    const keyboardDidShowListener =
      Platform.OS === 'android'
        ? Keyboard.addListener('keyboardDidShow', () => {
          setKeyboardVisible(true)
        })
        : { remove: () => { } }

    const keyboardWillHideListener =
      Platform.OS === 'ios'
        ? Keyboard.addListener('keyboardWillHide', () => {
          setKeyboardVisible(false)
          setKeyboardHeight(0)
        })
        : { remove: () => { } }

    const keyboardDidHideListener =
      Platform.OS === 'android'
        ? Keyboard.addListener('keyboardDidHide', () => {
          setKeyboardVisible(false)
        })
        : { remove: () => { } }

    return () => {
      keyboardWillShowListener.remove()
      keyboardDidShowListener.remove()
      keyboardWillHideListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  // Scroll to bottom when keyboard appears
  useEffect(() => {
    if (keyboardVisible && flatListRef.current) {
      // Add delay to ensure flatlist is ready
      const timer = setTimeout(
        () => {
          flatListRef.current.scrollToEnd({ animated: true })
        },
        Platform.OS === 'ios' ? 100 : 200
      )

      return () => clearTimeout(timer)
    }
  }, [keyboardVisible])

  // Navigation handlers
  const navigateToProfile = useCallback((userId) => {
    router.push(`/profile/${userId}`)
  }, [])

  const navigateToHashtag = useCallback((hashtag) => {
    router.push(`/hashtag/${hashtag}`)
  }, [])

  const navigateToUsernameProfile = useCallback((username) => {
    router.push(`/profile/0?byUsername=${username.slice(1)}`)
  }, [])

  const navigateToLikes = useCallback((postId) => {
    router.push(`/post/likes/${postId}`)
  }, [])

  const navigateToReport = useCallback((postId) => {
    router.push(`/post/report/${postId}`)
  }, [])

  // Comment actions
  const handleReplyPost = () => {
    if (!commentText.trim()) return

    commentMutation.mutate({
      postId: inReplyToId || id,
      commentText,
      scope: replyScope,
      cw: hasCW,
    })

    setComment('')
    setInReplyToId(null)
    setReply(undefined)
    Keyboard.dismiss()
  }

  const handleReplyTo = (item, level) => {
    if (!item?.id || !item?.account?.id) return

    if (level + 1 >= 3) {
      router.push({
        pathname: `/post/comments/${item.id}`,
        params: {
          username: item.account.username,
          content: item.content_text && item.content_text.slice(8, 55) + '...',
          acct: item.account.acct,
        }
      }
      )
      return;
    }
    fetchChildren(item.id, level)

    commentRef.current?.focus()
    setReply({
      id: item.id,
      username: item.account.username,
      content: item.content_text && item.content_text.slice(8, 55) + '...',
      acct: item.account.acct,
    })
    setInReplyToId(item.id)
    setComment('@' + item.account.acct + ' ')
  }

  const clearReply = () => {
    setReply(undefined)
    setInReplyToId(null)
    setComment('')
    commentRef.current?.blur()
    Keyboard.dismiss()
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

  const handleCommentLike = useCallback((item) => {
    likeMutation.mutate({
      id: item.id,
      type: item.favourited ? 'unlike' : 'like',
    })
  }, [])

  const handleCommentDelete = useCallback((id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete your comment?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => commentDeleteMutation.mutate({ id }),
      },
    ])
  }, [])

  // Fetch child comments
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

  // List rendering
  const renderCommentItem = useCallback(
    ({ item }) => (
      <CommentItem
        item={item}
        onReply={handleReplyTo}
        onLike={handleCommentLike}
        onReport={navigateToReport}
        onDelete={handleCommentDelete}
        onShowLikes={navigateToLikes}
        onLoadChildren={fetchChildren}
        gotoProfile={navigateToProfile}
        gotoUsernameProfile={navigateToUsernameProfile}
        gotoHashtag={navigateToHashtag}
        user={user}
        childComments={childComments}
        loadingChildId={loadingChildId}
      />
    ),
    [childComments, loadingChildId, user]
  )

  const RenderEmptyState = useCallback(
    () => (
      <YStack h="100%" justifyContent="center" alignItems="center" gap="$3">
        <Text fontSize="$9" fontWeight="bold" color={theme.color?.val.default.val}>
          No comments yet
        </Text>
        <Text fontSize="$6" color={theme.color?.val.secondary.val}>
          Start the conversation
        </Text>
      </YStack>
    ),
    [theme]
  )

  // Mutations
  const commentMutation = useMutation({
    mutationFn: async ({ postId, commentText, scope, cw }) => {
      // debugger;
      setCommentActionPending(true);
      const res = await postComment({ postId, commentText, scope, cw });
      res.content_text = commentText;
      return { res }
    },
    onSuccess: ({ res }) => {
      let isChildrenReply = false;
      queryClient.setQueriesData({ queryKey: ['getStatusRepliesById', id] }, (old) => {
        if (!old?.pages) return old
        old.pages[0].data.map((commentItem) => {
          if (commentItem.id === res.in_reply_to_id) {
            isChildrenReply = true
            return;
          };
        })

        Object.keys(childComments).forEach((key) => {
          childComments[key].map((data) => {
            if (data.id === res.in_reply_to_id) {
              isChildrenReply = true;
              data.reply_count++;
              return;
            };
          })
        })

        if (!isChildrenReply) {
          old.pages[0].data.push(res);
        }
        return { ...old };
      })
      if (isChildrenReply) {
        // setLoadingChildId(res.in_reply_to_id);
        setChildComments((prevChildComments) => {
          const updatedChildComments = { ...prevChildComments }
          let isAlreadyPresent = false;
          Object.keys(updatedChildComments).forEach((key) => {
            if (key === res.in_reply_to_id) {
              isAlreadyPresent = true;
              updatedChildComments[key].push(res);
            }
          })
          if (!isAlreadyPresent) updatedChildComments[res.in_reply_to_id] = [res];
          Object.keys(updatedChildComments).forEach((key) => {
            updatedChildComments[key].map((item) => {
              if (item.id === res.id) item.reply_count++;
            });
          })
          return updatedChildComments
        })
        // setLoadingChildId(null);
      }
      setCommentActionPending(false);
    },
    onError: () => setCommentActionPending(false)
  })

  const likeMutation = useMutation({
    mutationFn: async ({ id, type }) => {
      const res = type === 'like' ? await likeStatus({ id }) : await unlikeStatus({ id })
      return { res, id, type }
    },
    onSuccess: ({ res, id }) => {
      // Update comments in query cache
      let isIdChildren = true
      queryClient.setQueriesData({ queryKey: ['getStatusRepliesById', id] }, (old) => {
        if (!old?.pages) return old

        const newPages = old.pages.map((page) => {
          const newData = page.data.map((post) => {
            if (post.id !== id) return post

            isIdChildren = false
            return {
              ...post,
              favourited: res.favourited,
              favourites_count: res.favourites_count,
              liked_by: res.liked_by,
            }
          })
          return { ...page, data: newData }
        })

        return { ...old, pages: newPages }
      })

      // Update child comments state if necessary
      if (isIdChildren) {
        setChildComments((prevChildComments) => {
          const updatedChildComments = { ...prevChildComments }

          Object.keys(updatedChildComments).forEach((key) => {
            updatedChildComments[key] = updatedChildComments[key].map((childComment) => {
              if (childComment.id === id) {
                return {
                  ...childComment,
                  favourited: res.favourited,
                  favourites_count: res.favourites_count,
                  liked_by: res.liked_by,
                }
              }
              return childComment
            })
          })

          return updatedChildComments
        })
      }
    },
  })

  const commentDeleteMutation = useMutation({
    mutationFn: async ({ id }) => {
      setCommentActionPending(true)
      const res = await deleteStatus({ id });
      return { res };
    },
    onSuccess: ({ res }) => {
      queryClient.setQueriesData({ queryKey: ['getStatusRepliesById', id] }, (old) => {
        if (!old?.pages) return old
        const newPages = old.pages.map((page) => {
          const newData = page.data.filter((post) => {
            return post.id !== res.id;
          })
          return { ...page, data: newData }
        })
        return { ...old, pages: newPages }
      })
      setChildComments((prevChildComments) => {
        if (prevChildComments && typeof prevChildComments === 'object') {
          for (const key in prevChildComments) {
            if (prevChildComments.hasOwnProperty(key)) {
              const value = prevChildComments[key];
              if (Array.isArray(value)) {
                prevChildComments[key] = value.filter(item => !(typeof item === 'object' && item !== null && item.id === res.id));
                prevChildComments[key] = prevChildComments[key].map((item) => {
                  if (item.id === res.in_reply_to_id) item.reply_count--;
                  return item;
                });
              }
            }
          }
        }
        return prevChildComments;
      })
      setCommentActionPending(false)
    },
    onError: () => setCommentActionPending(false)
  })

  // Query for comments
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

  // Loading state
  if (isFetching && !isFetchingNextPage) {
    return (
      <View flexGrow={1} mt="$5" justifyContent="center" alignItems="center">
        <ActivityIndicator color={theme.color?.val.default.val || '#000'} size="large" />
      </View>
    )
  }

  // Error state
  if (isError && error) {
    return (
      <View flexGrow={1} justifyContent="center" alignItems="center" p="$4">
        <Text color={theme.color?.val.default.val} fontSize="$6" textAlign="center">
          Error loading comments. Please try again.
        </Text>
      </View>
    )
  }



  // Render main screen
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background?.val.default.val }}
      edges={['left', 'right', 'bottom']}
    >
      <Stack.Screen
        options={{
          title: 'Comments',
          headerBackTitle: 'Back',
        }}
      />
      {commentActionPending && (
        <Modal transparent={true} animationType="fade" visible={commentActionPending}>
          <View style={styles.overlay}>
            <ActivityIndicator color={theme.color?.val.default.val || '#000'} size="large" />
          </View>
        </Modal>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={data?.pages.flatMap((page) => page.data)}
            keyExtractor={(item) => item?.id}
            renderItem={renderCommentItem}
            ListEmptyComponent={RenderEmptyState}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.contentCommentsContainer,
              {
                paddingBottom:
                  Platform.OS === 'android' && keyboardVisible
                    ? inputContainerHeight + 120
                    : inputContainerHeight + 40,
              },
            ]}
            onContentSizeChange={() => {
              if (keyboardVisible && flatListRef.current) {
                flatListRef.current.scrollToEnd({ animated: true })
              }
            }}
          />
        </View>

        {/* Input Container with platform-specific styling */}
        <View
          style={[
            styles.fixedInputContainer,
            {
              height: inputContainerHeight,
              borderColor: theme.borderColor?.val.default.val,
              backgroundColor: theme.background?.val.default.val,
              // For Android, we need to adjust position when keyboard is visible
              ...(Platform.OS === 'android' && {
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 999,
              }),
            },
          ]}
        >
          {/* Reply Info */}
          {inReplyToId && replySet ? (
            <View
              px="$4"
              style={[
                styles.replyContainer,
                { borderColor: theme.border?.val.default.val },
              ]}
            >
              <XStack justifyContent="space-between">
                <YStack>
                  <Text color={theme.color?.val.secondary.val}>
                    @
                    <Text
                      fontWeight="600"
                      fontFamily="system"
                      color={theme.color?.val.secondary.val}
                    >
                      {replySet.acct}
                    </Text>
                  </Text>
                  <Text color={theme.color?.val.default.val}>{replySet.content}</Text>
                </YStack>
                <Text color={theme.color?.val.secondary.val} onPress={clearReply}>
                  Clear
                </Text>
              </XStack>
            </View>
          ) : null}

          {/* Comment Input */}
          <YStack style={styles.inputGroup}>
            <TextInput
              ref={commentRef}
              style={[
                styles.input,
                {
                  color: theme.color?.val.default.val,
                  borderColor:
                    theme.borderColor?.val.default.val || 'rgba(151, 151, 151, 0.25)',
                  backgroundColor:
                    theme.backgroundHover?.val.default.val || 'rgba(151, 151, 151, 0.05)',
                },
              ]}
              value={commentText}
              onChangeText={setComment}
              multiline={true}
              maxLength={500}
              placeholder="Add a comment..."
              placeholderTextColor={theme.color?.val.secondary.val}
            />

            {/* Input Controls */}
            <XStack
              px="$5"
              pb="$4"
              mt={-25}
              justifyContent="space-between"
              alignItems="center"
            >
              {/* Character Counter */}
              <XStack>
                <Text
                  allowFontScaling={false}
                  fontWeight="bold"
                  fontSize={12}
                  color={theme.color?.val.secondary.val}
                >
                  {commentText.length}
                </Text>
                <Text
                  allowFontScaling={false}
                  fontWeight="bold"
                  fontSize={12}
                  color={theme.color?.val.secondary.val}
                >
                  /
                </Text>
                <Text
                  allowFontScaling={false}
                  fontWeight="bold"
                  fontSize={12}
                  color={theme.color?.val.secondary.val}
                >
                  500
                </Text>
              </XStack>

              {/* Visibility Toggle */}
              <XStack alignItems="center" gap={5}>
                <Pressable onPress={toggleScope} hitSlop={10}>
                  <Text
                    allowFontScaling={false}
                    color={theme.color?.val.secondary.val}
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
                  color={theme.color?.val.secondary.val}
                />
              </XStack>

              {/* Content Warning Toggle */}
              <XStack alignItems="center" gap={5}>
                <Text
                  allowFontScaling={false}
                  fontSize={12}
                  color={theme.color?.val.secondary.val}
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

              {/* Post Button */}
              <Pressable
                onPress={handleReplyPost}
                disabled={!commentText.trim()}
                hitSlop={10}
              >
                <Text
                  allowFontScaling={false}
                  color={
                    commentText.trim()
                      ? theme.colorHover.val.active.val
                      : `${theme.colorHover.val.active.val}80`
                  }
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
  contentCommentsContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  fixedInputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Elevation for Android
    elevation: 5,
  },
  replyContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
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
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
  },
})
