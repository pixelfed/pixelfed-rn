import type React from 'react'
import { useEffect, useRef } from 'react'
import { Animated, Dimensions, FlatList, StyleSheet, View } from 'react-native'
import { useTheme } from 'tamagui'

const { width: screenWidth } = Dimensions.get('window')

interface SkeletonItemProps {
  shimmerValue: Animated.Value
  backgroundColor: string
}

const SkeletonItem: React.FC<SkeletonItemProps> = ({
  shimmerValue,
  backgroundColor,
  shimmerBackgroundColor,
}) => {
  const shimmerTranslate = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  })

  const shimmerOpacity = shimmerValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.7, 0.3],
  })

  return (
    <View style={styles.skeletonItem}>
      <View style={styles.avatarContainer}>
        <View style={[styles.avatarSkeleton, { backgroundColor }]}>
          <Animated.View
            style={[
              styles.shimmer,
              {
                transform: [{ translateX: shimmerTranslate }],
                opacity: shimmerOpacity,
                backgroundColor: shimmerBackgroundColor,
              },
            ]}
          />
        </View>
      </View>

      <View style={[styles.usernameSkeleton, { backgroundColor }]}>
        <Animated.View
          style={[
            styles.shimmer,
            styles.usernameShimmer,
            {
              transform: [{ translateX: shimmerTranslate }],
              opacity: shimmerOpacity,
              backgroundColor: shimmerBackgroundColor,
            },
          ]}
        />
      </View>
    </View>
  )
}

const StorySkeletonLoader: React.FC = () => {
  const theme = useTheme()
  const shimmerValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    )

    shimmerAnimation.start()

    return () => shimmerAnimation.stop()
  }, [shimmerValue])

  const skeletonData = Array.from({ length: 6 }, (_, index) => ({ id: index }))

  const renderSkeletonItem = () => (
    <SkeletonItem
      shimmerValue={shimmerValue}
      backgroundColor={theme.color?.val?.tertiary?.val}
      shimmerBackgroundColor={theme.color.val.default.val}
    />
  )

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={skeletonData}
        renderItem={renderSkeletonItem}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  skeletonItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  avatarContainer: {
    marginBottom: 8,
  },
  avatarSkeleton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E1E9EE',
    overflow: 'hidden',
    position: 'relative',
  },
  usernameSkeleton: {
    width: 60,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E1E9EE',
    overflow: 'hidden',
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  usernameShimmer: {
    borderRadius: 6,
  },
})

export default StorySkeletonLoader
