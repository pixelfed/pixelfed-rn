import { getShareExtensionKey } from 'expo-share-intent'

export function redirectSystemPath({ path, initial }: { path: string; initial: string }) {
  try {
    if (path.includes(`dataUrl=${getShareExtensionKey()}`)) {
      return '/camera'
    }
    return path
  } catch {
    return '/'
  }
}
