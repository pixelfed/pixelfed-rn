import React, { createContext, useState, useContext } from 'react';

const VideoContext = createContext();

export const VideoProvider = ({ children }) => {
  const [currentVideoId, setCurrentVideoId] = useState(null);

  const playVideo = (id) => {
    setCurrentVideoId(id);
  };

  return (
    <VideoContext.Provider value={{ currentVideoId, playVideo }}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = () => useContext(VideoContext);