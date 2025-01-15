import Feather from '@expo/vector-icons/Feather'
import { useMemo, useState } from 'react'
import type { SelectProps } from 'tamagui'
import {
  Adapt,
  Label,
  Select,
  Separator,
  Sheet,
  XStack,
  YStack,
  View,
} from 'tamagui'

export function FormSelect(props: any) {
  return (
    <YStack flexGrow={1} gap="$4">
      <XStack alignItems="center" justifyContent="space-between" gap="$4">
        <Label miw={80} fontSize="$5" color="$gray9">
          {props?.label}
        </Label>
        <FormSelectItem
          options={props?.options}
          defaultValue={props?.defaultValue}
          open={props.open}
        />
      </XStack>
    </YStack>
  )
}

export function FormSelectItem(props: SelectProps) {
  const [val, setVal] = useState(props?.defaultValue)

  return (
    <Select value={val} onValueChange={setVal} disablePreventBodyScroll {...props}>
      <Select.Trigger width={220} iconAfter={<Feather name="chevron-down" />}>
        <Select.Value placeholder="Select an option" />
      </Select.Trigger>

      <Adapt when="sm" platform="touch">
        <Sheet
          modal
          dismissOnSnapToBottom
          animationConfig={{
            type: 'spring',
            damping: 20,
            mass: 1.2,
            stiffness: 250,
          }}
        >
          <Sheet.Frame>
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Frame>
          <Sheet.Overlay
            animation="lazy"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>

      <Select.Content zIndex={200000}>
        <Select.ScrollUpButton
          alignItems="center"
          justifyContent="center"
          position="relative"
          width="100%"
          height="$3"
        >
          <YStack zIndex={10}>
            <Feather name="chevron-up" size={20} />
          </YStack>
        </Select.ScrollUpButton>

        <Select.Viewport
          // to do animations:
          animation="quick"
          animateOnly={['transform', 'opacity']}
          enterStyle={{ o: 0, y: -10 }}
          exitStyle={{ o: 0, y: 10 }}
        >
          <Select.Group>
            {/* <Select.Label>Select</Select.Label> */}
            {/* for longer lists memoizing these is useful */}
            {useMemo(
              () =>
                props?.options?.map((item, i) => {
                  return (
                    <View key={item.name}>
                      <Separator />
                      <Select.Item
                        index={i}
                        value={item.name}
                        py="$3"
                        alignItems="center"
                      >
                        <YStack flexGrow={1} py="$2">
                          <XStack>
                            <Select.ItemText
                              flexWrap="wrap"
                              fontSize="$6"
                              fontWeight={val == item.name ? 'bold' : 'normal'}
                            >
                              {item.name}
                            </Select.ItemText>
                            <Select.ItemIndicator marginLeft="auto">
                              <Feather name="check" size={16} />
                            </Select.ItemIndicator>
                          </XStack>
                        </YStack>
                      </Select.Item>
                    </View>
                  )
                }),
              [props, val]
            )}
          </Select.Group>
        </Select.Viewport>

        <Select.ScrollDownButton
          alignItems="center"
          justifyContent="center"
          position="relative"
          width="100%"
          height="$3"
        >
          <YStack zIndex={10}>
            <Feather name="chevron-down" size={20} />
          </YStack>
        </Select.ScrollDownButton>
      </Select.Content>
    </Select>
  )
}
