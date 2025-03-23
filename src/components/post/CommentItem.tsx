import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native'

import { Feather, Ionicons } from '@expo/vector-icons'
import { BottomSheetFlatList, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FlatList } from 'react-native-gesture-handler'
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
import { Separator, Text, View, XStack, YStack, useTheme } from 'tamagui'
import AutolinkText from '../common/AutolinkText'
import ReadMore from '../common/ReadMore'
import { Switch } from '../form/Switch'

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function CommentItem({
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
}) {
  const captionText = htmlToTextWithLineBreaks(item.content)
  const postType = item.pf_type
  const isChild = level > 0
  const hasChildren = item.reply_count > 0
  const isLoadingChildren = loadingChildId === item.id
  const childrenForComment = childComments?.[item.id] || []
  const theme = useTheme()

  return (
    <YStack>
      <View style={[styles.itemContainer, { backgroundColor: theme.background?.val.default.val }, isChild && { paddingLeft: 50 * level }]}>
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
                    <Text fontSize="$3" fontWeight="bold" color={theme.color?.val.secondary.val}>
                      {item.account.acct}
                    </Text>
                  </Pressable>
                  <Text fontSize="$3" color={theme.color?.val.secondary.val}>
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
                    <Text fontWeight="bold" fontSize="$3" color={theme.color?.val.secondary.val}>
                      Reply
                    </Text>
                  </Pressable>
                  {item.favourites_count > 0 && (
                    <Pressable onPress={() => onShowLikes(item.id)}>
                      <Text fontSize="$3" color={theme.color?.val.secondary.val}>
                        {likeCountLabel(item?.favourites_count)}
                      </Text>
                    </Pressable>
                  )}
                  {item.account.id !== user?.id ? (
                    <Pressable onPress={() => onReport(item.id)}>
                      <Text fontSize="$3" color={theme.color?.val.secondary.val}>
                        Report
                      </Text>
                    </Pressable>
                  ) : (
                    <Pressable onPress={() => onDelete(item.id)}>
                      <Text fontSize="$3" color={theme.color?.val.secondary.val}>
                        Delete
                      </Text>
                    </Pressable>
                  )}
                </XStack>

                {hasChildren && !childrenForComment.length && (
                  <YStack mt="$3">
                    {isLoadingChildren ? (
                      <XStack gap="$2" alignItems="center">
                        <View w={20} h={1} color={theme.background?.val.default.val} />
                        <ActivityIndicator />
                      </XStack>
                    ) : (
                      <Pressable onPress={() => onLoadChildren(item.id, level + 1)}>
                        <XStack gap="$2" alignItems="center">
                          <View w={20} h={1} backgroundColor={theme.background?.val.secondary.val} />
                          <Text fontSize="$3" color={theme.color?.val.secondary.val} fontWeight="bold">
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
                  <Ionicons name="heart-outline" color={theme.color?.val.default.val} size={20} />
                )}
                {item.favourites_count > 0 && (
                  <Text fontSize="$3" color={theme.color?.val.tertiary.val}>{prettyCount(item.favourites_count)}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
  },
  listContainer: {
    flex: 1,
  },
  contentCommentsContainer: {
    flexGrow: 1,
  },
  itemContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    padding: 15,
    marginBottom: 0,
  },
})
