import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTheme, XStack } from 'tamagui'

const StoriesExplanation = () => {
  const theme = useTheme()
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={['#FF6B6B', '#4ECDC4']}
          style={styles.gradientCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <View style={[styles.iconWrapper, styles.icon1]}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather name="camera" size={32} color="#FFFFFF" />
          </LinearGradient>
        </View>

        <View style={[styles.iconWrapper, styles.icon2]}>
          <LinearGradient
            colors={['#f093fb', '#f5576c']}
            style={styles.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather name="image" size={32} color="#FFFFFF" />
          </LinearGradient>
        </View>

        <View style={[styles.iconWrapper, styles.icon3]}>
          <LinearGradient
            colors={['#4facfe', '#00f2fe']}
            style={styles.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather name="users" size={28} color="#FFFFFF" />
          </LinearGradient>
        </View>

        <View style={[styles.iconWrapper, styles.icon4]}>
          <LinearGradient
            colors={['#43e97b', '#38f9d7']}
            style={styles.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather name="clock" size={32} color="#FFFFFF" />
          </LinearGradient>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: theme.color?.val.default.val }]}>
          Stories
        </Text>
        <Text style={[styles.description, { color: theme.color?.val.default.val }]}>
          Share your world. Stories live for 24 hours, then vanish.
        </Text>

        <View style={styles.featuresList}>
          <XStack gap="$3" alignItems="center">
            <Feather name="clock" size={18} color={theme.color?.val?.tertiary.val} />
            <Text style={[styles.featureItem, { color: theme.color?.val.tertiary.val }]}>
              Expire after 24 hours
            </Text>
          </XStack>
          <XStack gap="$3" alignItems="center">
            <Feather name="users" size={18} color={theme.color?.val?.tertiary.val} />
            <Text style={[styles.featureItem, { color: theme.color?.val.tertiary.val }]}>
              Only followers can see them
            </Text>
          </XStack>
          <XStack gap="$3" alignItems="center">
            <Feather name="type" size={18} color={theme.color?.val?.tertiary.val} />
            <Text style={[styles.featureItem, { color: theme.color?.val.tertiary.val }]}>
              Add custom text overlays
            </Text>
          </XStack>
          <XStack gap="$3" alignItems="center">
            <Feather name="image" size={18} color={theme.color?.val?.tertiary.val} />
            <Text style={[styles.featureItem, { color: theme.color?.val.tertiary.val }]}>
              Photos only
            </Text>
          </XStack>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    maxWidth: 320,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 140,
    height: 140,
    marginBottom: 32,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 40,
    opacity: 0.051,
  },
  iconWrapper: {
    position: 'absolute',
  },
  iconGradient: {
    borderRadius: 20,
    padding: 12,
    elevation: 8,
  },
  icon1: {
    top: 20,
    left: 30,
    transform: [{ rotate: '-15deg' }],
  },
  icon2: {
    top: 25,
    right: 20,
    transform: [{ rotate: '20deg' }],
  },
  icon3: {
    bottom: 25,
    left: 20,
    transform: [{ rotate: '10deg' }],
  },
  icon4: {
    bottom: 20,
    right: 20,
    transform: [{ rotate: '-25deg' }],
  },
  contentContainer: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  featuresList: {
    width: '100%',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureItem: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 24,
  },
})

export default StoriesExplanation
