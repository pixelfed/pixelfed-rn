import { Link } from 'expo-router'
import { Pressable } from 'react-native'
import UserAvatar from 'src/components/common/UserAvatar'
import ImageComponent from 'src/components/ImageComponent'
import { _timeAgo, enforceLen } from 'src/utils'
import { Text, useTheme, View, XStack, YStack } from 'tamagui'

interface RenderItemProps {
  item: Object
}

// Convert to functional component
const RenderItem = ({ item }: RenderItemProps) => {
  // Now we can use hooks correctly
  const theme = useTheme()

  const _msgText = (type) => {
    switch (type) {
      case 'like':
      case 'favourite':
        return 'liked a post'

      case 'follow':
        return 'followed you'

      case 'mention':
        return 'mentioned you'

      case 'reblog':
        return 'shared your post'

      default:
        return ' unknown notification type'
    }
  }

  return (
    <View px="$4" py="$2" key={item.id}>
      <XStack justifyContent="space-between" alignItems="center">
        <XStack gap="$3" alignItems="center">
          {item && item.account && item.account?.id && (
            <Link href={`/profile/${item.account.id}`} asChild>
              <Pressable>
                <UserAvatar url={item.account.avatar} />
              </Pressable>
            </Link>
          )}

          <YStack gap={5}>
            <XStack gap="$1" alignItems="center">
              <Text
                fontSize="$2"
                fontWeight={'bold'}
                allowFontScaling={false}
                color={theme.color?.val.default.val}
              >
                {enforceLen(item.account?.acct, 25, true)}{' '}
              </Text>
            </XStack>
            <XStack gap="$1" alignItems="center">
              {item.status ? (
                <Link href={`/post/${item.status.id}`} asChild>
                  <Text
                    fontSize="$2"
                    color={theme.colorHover.val.active.val}
                    fontWeight="bold"
                    allowFontScaling={false}
                  >
                    {_msgText(item.type)}
                  </Text>
                </Link>
              ) : (
                <Text
                  fontSize="$2"
                  allowFontScaling={false}
                  color={theme.color?.val.default.val}
                >
                  {_msgText(item.type)}
                </Text>
              )}
              <Text
                ml="$2"
                fontSize="$2"
                color={theme.color?.val.tertiary.val}
                fontWeight={'bold'}
                allowFontScaling={false}
              >
                {_timeAgo(item.created_at)}
              </Text>
            </XStack>
          </YStack>
        </XStack>

        {item.status &&
        item.status.media_attachments?.length &&
        item.status.media_attachments[0].type === 'image' ? (
          <Link
            href={`/post/${item.status.in_reply_to_id ? item.status.in_reply_to_id : item.status.id}`}
          >
            <ImageComponent
              placeholder={{
                blurhash: item?.status?.media_attachments[0]?.blurhash || '',
              }}
              source={{ uri: item.status.media_attachments[0].url }}
              style={{ width: 50, height: 50, borderRadius: 5 }}
              contentFit={'cover'}
            />
          </Link>
        ) : null}
      </XStack>
    </View>
  )
}

export default RenderItem
