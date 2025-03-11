import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import {
  GestureEvent,
  HandlerStateChangeEvent,
  PinchGestureHandler,
  PinchGestureHandlerEventPayload,
  State,
} from 'react-native-gesture-handler'
import { Image } from 'expo-image'

interface ZoomableImageProps {
  source: any
  placeholder?: any
  style: any
}

export default function ZoomableImage({
  source,
  placeholder,
  style,
}: ZoomableImageProps) {
  const AnimatedFastImage = Animated.createAnimatedComponent(Image)

  const scale = useSharedValue(1)
  const savedScale = useSharedValue(1)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const originX = useSharedValue(0)
  const originY = useSharedValue(0)

  const onGestureEvent = (event: GestureEvent<PinchGestureHandlerEventPayload>) => {
    const pinchScale = event.nativeEvent.scale
    const nextScale = savedScale.value * pinchScale
    const touchX = event.nativeEvent.focalX
    const touchY = event.nativeEvent.focalY

    if (scale.value === savedScale.value) {
      originX.value = touchX
      originY.value = touchY
    }

    const focalDeltaX = (touchX - originX.value) * (pinchScale - 1)
    const focalDeltaY = (touchY - originY.value) * (pinchScale - 1)

    scale.value = nextScale
    translateX.value = focalDeltaX
    translateY.value = focalDeltaY
  }

  const onHandlerStateChange = (
    event: HandlerStateChangeEvent<PinchGestureHandlerEventPayload>
  ) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      savedScale.value = scale.value
      scale.value = withSpring(1)
      savedScale.value = 1
      translateX.value = withSpring(0)
      translateY.value = withSpring(0)
    }
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }))

  return (
    <PinchGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View>
        <AnimatedFastImage
          source={source}
          placeholder={placeholder}
          style={[style, animatedStyle]}
          contentFit={'cover'}
        />
      </Animated.View>
    </PinchGestureHandler>
  )
}
