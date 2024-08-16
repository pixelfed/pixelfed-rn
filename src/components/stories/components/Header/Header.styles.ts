import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    top: 32,
  },
  containerFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    borderWidth: 1.5,
    borderColor: '#FFF',
    overflow: 'hidden',
  },
})
