import React, { PureComponent } from 'react';
import { Pressable } from 'react-native';
import { Stack, Link } from 'expo-router'
import { Text, View, YStack, XStack, Input } from 'tamagui'
import UserAvatar from 'src/components/common/UserAvatar'
import {_timeAgo} from 'src/utils';

class RenderItem extends PureComponent {
  render() {
    const { item } = this.props;
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

            <XStack>
              <Text fontWeight={'bold'}>{item.account.username} </Text>
              {item.status ? (
                <Link
                  href={`/post/${item.status.in_reply_to_id ? item.status.in_reply_to_id : item.status.id}`}
                  asChild
                >
                  <Text color="$blue10" fontWeight="bold">
                    {_msgText(item.type)}
                  </Text>
                </Link>
              ) : (
                <Text>{_msgText(item.type)}</Text>
              )}
            </XStack>
          </XStack>

          <Text color="$gray9" fontWeight={'bold'} fontSize="$3">
            {_timeAgo(item.created_at)}
          </Text>
        </XStack>
      </View>
    );
  }
}

export default RenderItem;
