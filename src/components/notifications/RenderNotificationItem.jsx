import React, { PureComponent } from 'react'
import { Pressable } from 'react-native'
import { Link } from 'expo-router'
import { Text, View, YStack, XStack } from 'tamagui'
import UserAvatar from 'src/components/common/UserAvatar'
import { _timeAgo } from 'src/utils'
import FastImage from 'react-native-fast-image'
import { enforceLen } from 'src/utils'

class RenderItem extends PureComponent {
  render() {
    const { item } = this.props
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
            <Link href={`/profile/${item.account.id}`} asChild>
              <Pressable>
                <UserAvatar url={item.account.avatar} />
              </Pressable>
            </Link>

            <YStack gap={5}>
              <XStack gap="$1" alignItems="center">
                <Text fontSize="$2" fontWeight={'bold'} allowFontScaling={false}>
                  {enforceLen(item.account.acct, 25, true)}{' '}
                </Text>
              </XStack>
              <XStack gap="$1" alignItems="center">
                {item.status ? (
                  <Link
                    href={`/post/${item.status.in_reply_to_id ? item.status.in_reply_to_id : item.status.id}`}
                    asChild
                  >
                    <Text
                      fontSize="$2"
                      color="$blue10"
                      fontWeight="bold"
                      allowFontScaling={false}
                    >
                      {_msgText(item.type)}
                    </Text>
                  </Link>
                ) : (
                  <Text fontSize="$2" allowFontScaling={false}>
                    {_msgText(item.type)}
                  </Text>
                )}
                <Text
                  ml="$2"
                  fontSize="$2"
                  color="$gray9"
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
              <FastImage
                source={{ uri: item.status.media_attachments[0].url }}
                style={{ width: 50, height: 50, borderRadius: 5 }}
                resizeMode={FastImage.resizeMode.cover}
              />
            </Link>
          ) : null}
        </XStack>
      </View>
    )
  }
}

export default RenderItem
