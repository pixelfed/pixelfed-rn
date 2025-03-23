import { StyleSheet } from 'react-native'
import { Text, YStack, useTheme } from 'tamagui'
import GhostIcon from '../icons/GhostIcon'

const almostBlack = 'rgb(64, 64, 64)'

export default function EmptyFeed() {
  const theme = useTheme();
  return (
    <YStack
      p="$4"
      pt="$12"
      alignContent="center"
      justifyContent="center"
      alignItems="center"
    >
      <GhostIcon width={200} height={200} color={theme.color?.val.default.val} />

      <Text style={[styles.noPostsHeader, {color: theme.color?.val.default.val}]}>Ghosts have taken over this timeline!</Text>
      <Text style={[styles.noPostsText,{color: theme.color?.val.default.val}]}>
        Try following some accounts to get rid of them!
      </Text>
    </YStack>
  )
}

const styles = StyleSheet.create({
  noPostsHeader: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 24,
    paddingTop: 24,
  },
  noPostsText: {
    textAlign: 'center',
  },
})
