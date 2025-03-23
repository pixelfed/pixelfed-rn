import { Avatar, useTheme } from 'tamagui'

export default function UserAvatar({ url, width = 40, height = 40, size = '$4' }) {
  const theme = useTheme()
  return (
    <Avatar circular borderWidth={1} borderColor={theme.borderColor?.val.default.val} size={size}>
      <Avatar.Image
        source={{
          uri: url,
          width: width,
          height: height,
        }}
      />
      <Avatar.Fallback
        backgroundColor={theme.background?.val.tertiary.val}
        width={width}
        height={height}
        delayMs={300}
      />
    </Avatar>
  )
}
