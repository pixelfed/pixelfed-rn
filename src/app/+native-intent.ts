import { getShareExtensionKey } from 'expo-share-intent'

export function redirectSystemPath({
  path,
  initial,
}: {
  path: string
  initial: string
}) {
  try {
    if (path.includes(`dataUrl=${getShareExtensionKey()}`)) {
      // redirect to the ShareIntent Screen to handle data with the hook
      console.debug('[expo-router-native-intent] redirect to ShareIntent screen')
      return '/camera'
    }
    return path
  } catch {
    return '/'
  }
}
