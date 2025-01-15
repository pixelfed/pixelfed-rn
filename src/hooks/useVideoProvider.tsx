import type { PropsWithChildren } from 'hoist-non-react-statics/node_modules/@types/react'
import React, { createContext, useState, useContext } from 'react'

const VideoContext = createContext<{
  currentVideoId: string | null
  playVideo: (id: string) => void
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
