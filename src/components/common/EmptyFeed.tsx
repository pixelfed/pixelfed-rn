import { Text, YStack } from 'tamagui'
import { StyleSheet } from 'react-native'
import GhostIcon from '../icons/GhostIcon'

const almostBlack = 'rgb(64, 64, 64)'

export default function EmptyFeed() {
  return (
    <YStack
      p='$4'
      pt='$12'
      alignContent='center'
      justifyContent='center'
      alignItems='center'
    >
      <GhostIcon width={200} height={200} color={almostBlack}/>

      <Text style={styles.noPostsHeader}>
        Ghosts have taken over this timeline! 
      </Text>
      <Text style={styles.noPostsText}>
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
    color: 'darkgray',
    paddingTop: 24
  },
  noPostsText: {
    textAlign: 'center',
    color: 'darkgray'
  }
})
