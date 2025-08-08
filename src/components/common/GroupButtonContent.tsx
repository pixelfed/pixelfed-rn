import { Feather } from '@expo/vector-icons'
import { Text, useTheme, XStack } from 'tamagui'

export interface GroupButtonContentProps {
  icon: React.ComponentProps<typeof Feather>['name']
  title: string
  spacing?: 'normal' | 'privacy'
  iconColor?: string
}

export function GroupButtonContent({
  icon,
  title,
  spacing = 'normal',
  iconColor = '#000',
}: GroupButtonContentProps) {
  const theme = useTheme()
  return (
    <XStack flexGrow={1} justifyContent="space-between" alignItems="center">
      <XStack
        alignItems="center"
        gap="$3"
        {...(spacing === 'normal' ? { ml: '$1' } : { pl: '$5' })}
      >
        <Feather name={icon} size={17} color={theme.color?.val.tertiary.val} />
        <Text fontSize="$6" color={theme.color?.val.default.val}>
          {title}
        </Text>
      </XStack>
      <Feather name="chevron-right" size={20} color="#ccc" />
    </XStack>
  )
}
