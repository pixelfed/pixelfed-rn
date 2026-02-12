import { Toast, useToastState } from '@tamagui/toast'
import { YStack } from 'tamagui'

const GlobalToast = () => {
  const currentToast = useToastState()
  const toast = useToastController()

  if (!currentToast || currentToast.isHandledNatively) return null
  return (
    <Toast
      key={currentToast.id}
      duration={currentToast.duration}
      enterStyle={{ opacity: 0, scale: 1, y: 20 }}
      exitStyle={{ opacity: 0, scale: 1, y: 20 }}
      y={0}
      opacity={1}
      scale={1}
      animation="100ms"
      viewportName={currentToast.viewportName}
      onOpenChange={(open) => {
        if (!open) {
          toast.hide()  // Clear the global toast state when toast closes
        }
      }}
    >
      <YStack>
        <Toast.Title textAlign="center">{currentToast.title}</Toast.Title>
        {!!currentToast.message && (
          <Toast.Description textAlign="center">{currentToast.message}</Toast.Description>
        )}
      </YStack>
    </Toast>
  )
}

export default GlobalToast
