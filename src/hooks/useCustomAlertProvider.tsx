import type React from 'react'
import { createContext, type ReactNode, useContext, useState } from 'react'
import { Modal } from 'react-native'
import { AlertDialog, Button, Text, useTheme, XStack, YStack } from 'tamagui'

interface AlertConfig {
  title: string
  text: string
  actionText: string
  onPress: () => void
  showCancel?: boolean
  cancelText?: string
  useNativeModal?: boolean
  zIndex?: number
}

interface AlertContextType {
  show: (
    title: string,
    text: string,
    actionText: string,
    onPress: () => void,
    options?: {
      showCancel?: boolean
      cancelText?: string
      useNativeModal?: boolean
      zIndex?: number
    }
  ) => void
  hide: () => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

interface AlertProviderProps {
  children: ReactNode
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<AlertConfig | null>(null)
  const theme = useTheme()

  const show = (
    title: string,
    text: string,
    actionText: string,
    onPress: () => void,
    options: {
      showCancel?: boolean
      cancelText?: string
      useNativeModal?: boolean
      zIndex?: number
    } = {}
  ) => {
    setConfig({
      title,
      text,
      actionText,
      onPress,
      showCancel: options.showCancel ?? true,
      cancelText: options.cancelText ?? 'Cancel',
      useNativeModal: options.useNativeModal ?? false,
      zIndex: options.zIndex ?? 9999,
    })
    setIsOpen(true)
  }

  const hide = () => {
    setIsOpen(false)
  }

  const handleActionPress = () => {
    if (config?.onPress) {
      config.onPress()
    }
    hide()
  }

  const handleCancelPress = () => {
    hide()
  }

  return (
    <AlertContext.Provider value={{ show, hide }}>
      {children}

      {config && config.useNativeModal ? (
        <Modal visible={isOpen} transparent animationType="fade" onRequestClose={hide}>
          <YStack
            flex={1}
            backgroundColor="rgba(0,0,0,0.5)"
            justifyContent="center"
            alignItems="center"
            padding="$4"
          >
            <YStack
              backgroundColor={theme.background.val?.default.val}
              borderRadius="$4"
              borderColor={theme.borderColor?.val.strong.val}
              borderWidth={1}
              padding="$4"
              maxWidth={350}
              width="100%"
              elevate
            >
              <YStack space="$3">
                <Text
                  fontSize="$7"
                  fontWeight="600"
                  color={theme.color?.val?.default.val}
                >
                  {config.title}
                </Text>

                <Text
                  fontSize="$5"
                  color={theme.color?.val?.default.val}
                >
                  {config.text}
                </Text>

                <XStack space="$3" justifyContent="flex-end" marginTop="$2">
                  {config.showCancel && (
                    <Button
                      variant="outlined"
                      size="$3"
                      onPress={handleCancelPress}
                      borderColor={theme.borderColor?.val?.default.val}
                      color={theme.color?.val?.tertiary.val}
                      backgroundColor="transparent"
                      pressStyle={{
                        backgroundColor: '$color2',
                      }}
                    >
                      {config.cancelText}
                    </Button>
                  )}

                  <Button
                    size="$3"
                    theme="active"
                    onPress={handleActionPress}
                    backgroundColor={theme.background?.val?.inverse.val}
                    color={theme.color?.val?.inverse.val}
                    fontWeight={'bold'}
                    pressStyle={{
                      backgroundColor: theme.background?.val?.tertiary.val,
                    }}
                  >
                    {config.actionText}
                  </Button>
                </XStack>
              </YStack>
            </YStack>
          </YStack>
        </Modal>
      ) : (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialog.Portal>
            <AlertDialog.Overlay
              key="overlay"
              animation="quick"
              opacity={0.5}
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
              zIndex={config?.zIndex || 9999}
            />
            <AlertDialog.Content
              bordered
              elevate
              key="content"
              animation={[
                'quick',
                {
                  opacity: {
                    overshootClamping: true,
                  },
                },
              ]}
              enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
              exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
              x={0}
              scale={1}
              opacity={1}
              y={0}
              backgroundColor={theme.background.val?.default.val}
              maxWidth={350}
              padding="$4"
              borderRadius="$4"
              zIndex={(config?.zIndex || 9999) + 1}
            >
              <YStack space="$3">
                <AlertDialog.Title asChild>
                  <Text fontSize="$6" fontWeight="600" color="$color12">
                    {config?.title}
                  </Text>
                </AlertDialog.Title>

                <AlertDialog.Description asChild>
                  <Text fontSize="$4" color="$color11" lineHeight="$1">
                    {config?.text}
                  </Text>
                </AlertDialog.Description>

                <XStack space="$3" justifyContent="flex-end" marginTop="$2">
                  {config?.showCancel && (
                    <AlertDialog.Cancel asChild>
                      <Button
                        variant="outlined"
                        size="$3"
                        onPress={handleCancelPress}
                        borderColor="$borderColor"
                        color="$color11"
                        backgroundColor="transparent"
                        pressStyle={{
                          backgroundColor: '$color2',
                        }}
                      >
                        {config?.cancelText}
                      </Button>
                    </AlertDialog.Cancel>
                  )}

                  <AlertDialog.Action asChild>
                    <Button
                      size="$3"
                      theme="active"
                      onPress={handleActionPress}
                      backgroundColor="$blue9"
                      color="white"
                      pressStyle={{
                        backgroundColor: '$blue10',
                      }}
                    >
                      {config?.actionText}
                    </Button>
                  </AlertDialog.Action>
                </XStack>
              </YStack>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog>
      )}
    </AlertContext.Provider>
  )
}

export const useCustomAlert = (): AlertContextType => {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useCustomAlert must be used within an AlertProvider')
  }
  return context
}
