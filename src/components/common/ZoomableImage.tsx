import { Image } from 'expo-image'
import { useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { PinchGestureHandler, State } from 'react-native-gesture-handler'

const AnimatedImage = Animated.createAnimatedComponent(Image)

const PinchZoomImage = ({ source, style, placeholder }) => {
  const scale = useRef(new Animated.Value(1)).current
  const lastScale = useRef(1)

  const onPinchGestureEvent = Animated.event([{ nativeEvent: { scale: scale } }], {
    useNativeDriver: true,
  })

  const onPinchHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastScale.current *= event.nativeEvent.scale

      // Animate back to original scale
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 5,
      }).start(() => {
        lastScale.current = 1
        scale.setValue(1)
      })
    }
  }

  return (
    <PinchGestureHandler
      onGestureEvent={onPinchGestureEvent}
      onHandlerStateChange={onPinchHandlerStateChange}
    >
      <Animated.View style={styles.container}>
        <AnimatedImage
          source={source}
          style={[
            style,
            {
              transform: [{ scale }],
            },
          ]}
          placeholder={placeholder}
        />
      </Animated.View>
    </PinchGestureHandler>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

const ZoomableImage = ({ source, style, placeholder }) => {
  return (
    <View style={{ flex: 1 }}>
      <PinchZoomImage source={source} style={style} placeholder={placeholder} />
    </View>
  )
}

export default ZoomableImage
