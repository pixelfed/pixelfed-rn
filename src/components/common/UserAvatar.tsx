import { Avatar } from 'tamagui'

export default function UserAvatar({ url, width, height }) {
  return (
    <Avatar circular borderWidth={1} borderColor="$gray6">
      <Avatar.Image
        source={{
          uri: url,
          width: 40,
          height: 40,
        }}
      />
      <Avatar.Fallback backgroundColor="$gray6" />
    </Avatar>
  )
}
