import { Image } from 'expo-image'
import React, { useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { PinchGestureHandler, State } from 'react-native-gesture-handler'

const AnimatedImage = Animated.createAnimatedComponent(Image)

const PinchZoomImage = ({ source, style, placeholder }) => {
  const scale = useRef(new Animated.Value(1)).current

  const onPinchGestureEvent = Animated.event([{ nativeEvent: { scale } }], {
    useNativeDriver: true,
  })

  const onPinchHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 0,
      }).start()
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
