import Feather from '@expo/vector-icons/Feather'
import { BlurView } from '@react-native-community/blur'
import React, { useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { PressableOpacity } from 'react-native-pressable-opacity'
import Video from 'react-native-video'
import { useVideo } from 'src/hooks/useVideoProvider'

const VideoPlayer = ({ source, height, videoId }) => {
  const { currentVideoId, playVideo } = useVideo()
  const videoRef = useRef(null)

  const isPaused = currentVideoId !== videoId

  const onPlayPausePress = () => {
    if (isPaused) {
      playVideo(videoId)
    } else {
      playVideo(null)
    }
  }
  return (
    <View style={[styles.container, { height: height }]}>
      <PressableOpacity
        style={styles.videoContainer}
        onPress={onPlayPausePress}
        activeOpacity={0.98}
      >
        <Video
          ref={videoRef}
          source={{ uri: source }}
          style={styles.video}
          paused={isPaused}
          resizeMode="cover"
          repeat={true}
        />

        {isPaused && (
          <View style={styles.playButton}>
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="dark"
              blurAmount={10}
              reducedTransparencyFallbackColor="white"
            />
            <Feather name="play" size={40} color="#fff" left={4} />
          </View>
        )}
      </PressableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 50,
    overflow: 'hidden',
    width: 60,
    height: 60,
  },
})

export default VideoPlayer
