/* eslint-disable global-require */
import { STORAGE_KEY } from '../constants'
import type { ProgressStorageProps } from '../dto/helpersDTO'
import { Storage } from 'src/state/cache'


export const clearProgressStorage = async () => {
  try {
    return Storage.delete(STORAGE_KEY)
  } catch (error) {
    return null
  }
}

export const getProgressStorage = async (): Promise<ProgressStorageProps> => {
  try {
    const progress = Storage.getString(STORAGE_KEY)
    console.log(progress)
    return progress ? JSON.parse(progress) : {}
  } catch (error) {
    return {}
  }
}

export const setProgressStorage = async (user: string, lastSeen: string) => {
  const progress = await getProgressStorage()
  console.log(progress)
  progress[user] = lastSeen

  try {
    Storage.set(STORAGE_KEY, JSON.stringify(progress))
    return progress
  } catch (error) {
    return {}
  }
}
