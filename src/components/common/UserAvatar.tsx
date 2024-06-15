import { Avatar } from 'tamagui'

export default function UserAvatar({ url, width = 40, height = 40, size = '$4' }) {
  return (
    <Avatar circular borderWidth={1} borderColor="$gray6" size={size}>
      <Avatar.Image
        source={{
          uri: url,
          width: width,
          height: height,
        }}
      />
      <Avatar.Fallback
        backgroundColor="$gray10"
        width={width}
        height={height}
        delayMs={600}
      />
    </Avatar>
  )
}
