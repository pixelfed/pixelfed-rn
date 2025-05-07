import type { PropsWithChildren } from 'react'
import { createContext, useContext, useState } from 'react'

const VideoContext = createContext<{
  currentVideoId: string | null
  playVideo: (id: string | null) => void
}>({
  currentVideoId: null,
  playVideo: () => {
    throw new Error('playVideo called outside of Video Context')
  },
})

export const VideoProvider = ({ children }: PropsWithChildren) => {
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null)

  const playVideo = (id: string | null) => {
    setCurrentVideoId(id)
  }

  return (
    <VideoContext.Provider value={{ currentVideoId, playVideo }}>
      {children}
    </VideoContext.Provider>
  )
}

export const useVideo = () => useContext(VideoContext)
