import { Dimensions } from 'react-native'

export const { width: WIDTH, height: HEIGHT } = Dimensions.get('window')

export const STORAGE_KEY = 'stories:v1:key'

export const DEFAULT_COLORS = [
  '#F7B801',
  '#F18701',
  '#F35B04',
  '#F5301E',
  '#C81D4E',
  '#8F1D4E',
]
export const LOADER_COLORS = ['#FFF']
export const SEEN_LOADER_COLORS = ['#aaa']
export const PROGRESS_COLOR = '#00000099'
export const PROGRESS_ACTIVE_COLOR = '#FFFFFF'
export const BACKGROUND_COLOR = '#000000'
export const CLOSE_COLOR = '#FFFFFF'

export const LOADER_ID = 'gradient'
export const LOADER_URL = `url(#${LOADER_ID})`

export const STROKE_WIDTH = 2

export const AVATAR_SIZE = 60
export const AVATAR_OFFSET = 5
export const STORY_AVATAR_SIZE = 26

export const STORY_ANIMATION_DURATION = 800
export const ANIMATION_DURATION = 10000
export const LONG_PRESS_DURATION = 500
