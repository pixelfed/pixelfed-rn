import type { ReactNode } from 'react'
import type {
  ImageProps,
  ImageStyle,
  ScrollViewProps,
  TextStyle,
  ViewStyle,
  TextProps,
} from 'react-native'

export interface StoryItemProps {
  id: string
  /**
   * @deprecated Use {@link source} instead (set source to {uri: 'your url'}).
   */
  sourceUrl?: string
  source: ImageProps['source']
  mediaType?: 'image' | 'video'
  duration?: number
  createdAt?: string
  animationDuration?: number
  renderContent?: () => ReactNode
  renderFooter?: () => ReactNode
}

export interface PixelfedStoryProps {
  id: string
  /**
   * @deprecated Use {@link avatarSource} instead (set avatarSource to {uri: 'your url'}).
   */
  avatar?: string
  avatarSource?: ImageProps['source']
  renderAvatar?: () => ReactNode
  renderStoryHeader?: () => ReactNode
  onStoryHeaderPress?: () => void
  name?: string
  stories: StoryItemProps[]
}

export interface PixelfedStoriesProps {
  stories: PixelfedStoryProps[]
  saveProgress?: boolean
  avatarBorderColors?: string[]
  avatarSeenBorderColors?: string[]
  avatarSize?: number
  storyAvatarSize?: number
  /**
   * @deprecated Use {@link avatarListContainerStyle} instead.
   */
  listContainerStyle?: ScrollViewProps['contentContainerStyle']
  avatarListContainerStyle?: ScrollViewProps['contentContainerStyle']
  /**
   * @deprecated Use {@link avatarListContainerProps} instead.
   */
  listContainerProps?: ScrollViewProps
  avatarListContainerProps?: ScrollViewProps
  containerStyle?: ViewStyle
  textStyle?: TextStyle
  animationDuration?: number
  videoAnimationMaxDuration?: number
  backgroundColor?: string
  showName?: boolean
  nameTextStyle?: TextStyle
  nameTextProps?: TextProps
  videoProps?: any
  closeIconColor?: string
  progressActiveColor?: string
  progressColor?: string
  modalAnimationDuration?: number
  storyAnimationDuration?: number
  mediaContainerStyle?: ViewStyle
  imageStyles?: ImageStyle
  imageProps?: ImageProps
  isVisible?: boolean
  headerStyle?: ViewStyle
  headerContainerStyle?: ViewStyle
  progressContainerStyle?: ViewStyle
  hideAvatarList?: boolean
  imageOverlayView?: ReactNode
  hideElementsOnLongPress?: boolean
  onShow?: (id: string) => void
  onHide?: (id: string) => void
  onSwipeUp?: (userId?: string, storyId?: string) => void
  onStoryStart?: (userId?: string, storyId?: string) => void
  onStoryEnd?: (userId?: string, storyId?: string) => void
}

export type PixelfedStoriesPublicMethods = {
  spliceStories: (stories: PixelfedStoryProps[], index?: number) => void
  spliceUserStories: (stories: StoryItemProps[], user: string, index?: number) => void
  setStories: (stories: PixelfedStoryProps[]) => void
  clearProgressStorage: () => void
  hide: () => void
  show: (id?: string) => void
  pause: () => void
  resume: () => void
  goToPreviousStory: () => void
  goToNextStory: () => void
  getCurrentStory: () => { userId?: string; storyId?: string }
}
