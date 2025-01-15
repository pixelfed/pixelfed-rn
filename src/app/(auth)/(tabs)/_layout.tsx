import { useAuth } from '@state/AuthProvider'
import { Tabs, Redirect } from 'expo-router'
import { View } from 'tamagui'
import { Feather } from '@expo/vector-icons'

// enum here to prevent typos in id when used in multiple places (typescript checkable)
const enum TabName {
  Index = 'index',
  Network = 'network',
  Camera = 'camera',
  Discover = 'discover',
  Profile = 'profile'
}

export default function AppLayout() {
  const { user } = useAuth()

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!user) {
    return <Redirect href="/login" />
  }
  return (
    <Tabs initialRouteName={TabName.Index} backBehavior='order'>
      <Tabs.Screen
        name={TabName.Index}
        options={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather name="home" size={26} color={color} />,
        }}
      />

      <Tabs.Screen
        name={TabName.Network}
        options={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather name="users" size={23} color={color} />,
        }}
      />

      <Tabs.Screen
        name={TabName.Camera}
        options={{
          tabBarShowLabel: false,
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <View bg="$gray4" px="$3" py={4} borderRadius={5}>
              <Feather name="plus" size={26} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name={TabName.Discover}
        options={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather name="compass" size={26} color={color} />,
        }}
      />

      <Tabs.Screen
        name={TabName.Profile}
        options={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather name="user" size={26} color={color} />,
        }}
      />
    </Tabs>
  )
}
