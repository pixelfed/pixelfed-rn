import { StyleSheet } from 'react-native'
import { HEIGHT, WIDTH } from '../../core/constants'

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: WIDTH,
    height: HEIGHT,
  },
  bgAnimation: StyleSheet.absoluteFillObject,
})
