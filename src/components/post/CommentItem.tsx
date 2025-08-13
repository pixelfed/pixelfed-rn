import { Ionicons } from '@expo/vector-icons'
import { ActivityIndicator, Dimensions, Pressable, StyleSheet } from 'react-native'
import ImageComponent from 'src/components/ImageComponent'
import {
  _timeAgo,
  htmlToTextWithLineBreaks,
  likeCountLabel,
  prettyCount,
} from 'src/utils'
import { Text, useTheme, View, XStack, YStack } from 'tamagui'
import AutolinkText, { onMentionPressMethod } from '../common/AutolinkText'
import ReadMore from '../common/ReadMore'

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
      <View
        style={[
          styles.itemContainer,
          { backgroundColor: theme.background?.val.default.val },
          isChild && { paddingLeft: 50 * level },
        ]}
      >
        <YStack flexShrink={1}>
          <XStack flexShrink={1}>
            <XStack gap="$3" flexGrow={1}>
              <View>
                <Pressable onPress={() => gotoProfile(item.account.id)} hitSlop={8}>
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
              </View>

              <YStack flexGrow={1} maxWidth={SCREEN_WIDTH - (150 + level * 20)} gap={4}>
                <XStack gap="$2">
                  <Pressable onPress={() => gotoProfile(item?.account.id)} hitSlop={7}>
                    <Text
                      fontSize="$3"
                      fontWeight="bold"
                      color={theme.color?.val.secondary.val}
                    >
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
                    onMentionPress={onMentionPressMethod(
                      gotoUsernameProfile,
                      item.account.url
                    )}
                    onHashtagPress={gotoHashtag}
                  />
                </ReadMore>

                <XStack mt="$2" gap="$4">
                  <Pressable onPress={() => onReply(item, level)} hitSlop={7}>
                    <Text
                      fontWeight="bold"
                      fontSize="$3"
                      color={theme.color?.val.secondary.val}
                    >
                      Reply
                    </Text>
                  </Pressable>
                  {item.favourites_count > 0 && (
                    <Pressable onPress={() => onShowLikes(item.id)} hitSlop={7}>
                      <Text fontSize="$3" color={theme.color?.val.secondary.val}>
                        {likeCountLabel(item?.favourites_count)}
                      </Text>
                    </Pressable>
                  )}
                  {item.account.id !== user?.id ? (
                    <Pressable onPress={() => onReport(item.id)} hitSlop={7}>
                      <Text fontSize="$3" color={theme.color?.val.secondary.val}>
                        Report
                      </Text>
                    </Pressable>
                  ) : (
                    <Pressable onPress={() => onDelete(item.id)} hitSlop={7}>
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
                          <View
                            w={20}
                            h={1}
                            backgroundColor={theme.color?.val.tertiary.val}
                          />
                          <Text
                            fontSize="$3"
                            color={theme.color?.val.secondary.val}
                            fontWeight="bold"
                          >
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

            <View>
              <Pressable
                onPress={() => onLike(item)}
                hitSlop={{ left: 20, right: 14, top: 14, bottom: 14 }}
              >
                <YStack justifyContent="center" alignItems="center" gap="$1">
                  {item.favourited ? (
                    <Ionicons name="heart" color="red" size={20} />
                  ) : (
                    <Ionicons
                      name="heart-outline"
                      color={theme.color?.val.default.val}
                      size={20}
                    />
                  )}
                  {item.favourites_count > 0 && (
                    <Text fontSize="$3" color={theme.color?.val.tertiary.val}>
                      {prettyCount(item.favourites_count)}
                    </Text>
                  )}
                </YStack>
              </Pressable>
            </View>
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
