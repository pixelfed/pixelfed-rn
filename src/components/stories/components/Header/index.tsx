import React, { type FC, memo } from 'react'
import { View, Image, TouchableOpacity, Pressable } from 'react-native'
import { Text, XStack } from 'tamagui'
import { WIDTH } from '../../core/constants'
import HeaderStyles from './Header.styles'
import type { StoryHeaderProps } from '../../core/dto/componentsDTO'
import Close from '../Icon/close'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'

const StoryHeader: FC<StoryHeaderProps> = ({
  avatarSource,
  avatar,
  name,
  duration,
  createdAt,
  onClose,
  avatarSize,
  textStyle,
  closeColor,
  headerStyle,
  headerContainerStyle,
  renderStoryHeader,
  onStoryHeaderPress,
}) => {
  const styles = { width: avatarSize, height: avatarSize, borderRadius: avatarSize }
  const width = WIDTH - HeaderStyles.container.left * 2

  if (renderStoryHeader) {
    return (
      <View style={[HeaderStyles.container, { width }, headerContainerStyle]}>
        {renderStoryHeader()}
      </View>
    )
  }

  return (
    <View
      style={[
        HeaderStyles.container,
        HeaderStyles.containerFlex,
        { width },
        headerContainerStyle,
      ]}
    >
      <Pressable
        style={[HeaderStyles.left, headerStyle]}
        onPress={() => onStoryHeaderPress?.()}
      >
        {(Boolean(avatarSource) || Boolean(avatar)) && (
          <View style={[HeaderStyles.avatar, { borderRadius: styles.borderRadius }]}>
            <Image source={avatarSource ?? { uri: avatar }} style={styles} />
          </View>
        )}
        <XStack flexGrow={1} justifyContent="space-between">
          {Boolean(name) && (
            <Text style={textStyle} color="white" fontWeight={'bold'}>
              {name}
            </Text>
          )}
          {Boolean(createdAt) && (
            <Text style={textStyle} color="white" fontWeight={'bold'} mr="$3">
              {createdAt}
            </Text>
          )}
        </XStack>
      </Pressable>
      <TouchableOpacity onPress={onClose} hitSlop={16} testID="storyCloseButton">
        <Close color={closeColor} />
      </TouchableOpacity>
    </View>
  )
}

export default memo(StoryHeader)
