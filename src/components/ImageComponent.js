import { Image } from 'expo-image'

const ImageComponent = ({ source, style, resizeMode = false, ...props }) => {
  return (
    <Image
      source={source}
      style={style}
      contentFit={resizeMode ? mapResizeMode(resizeMode) : 'cover'}
      {...props}
    />
  )
}

const mapResizeMode = (mode) => {
  const map = {
    contain: 'contain',
    cover: 'cover',
    stretch: 'stretch',
    center: 'center',
  }
  return map[mode] || 'cover'
}

export default ImageComponent
