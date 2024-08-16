import { StyleSheet } from 'react-native'
import { WIDTH } from '../../core/constants'

export default StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    width: WIDTH,
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
})
