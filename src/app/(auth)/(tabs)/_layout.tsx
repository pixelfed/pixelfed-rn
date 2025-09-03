import { Feather } from '@expo/vector-icons'
import { useAuth } from '@state/AuthProvider'
import { Redirect, Tabs } from 'expo-router'
import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// enum here to prevent typos in id when used in multiple places (typescript checkable)
enum TabName {
  Index = 'index',
  Network = 'network',
  Explore = 'explore',
  Camera = 'camera',
  Discover = 'discover',
  Profile = 'profile',
  Notifications = 'notifications',
}

export default function AppLayout() {
  const { user } = useAuth()
  const insets = useSafeAreaInsets()

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!user) {
    return <Redirect href="/login" />
  }

  return (
    <Tabs
      initialRouteName={TabName.Index}
      backBehavior="history"
      screenOptions={{
        tabBarStyle: {
          height: (Platform.OS === 'ios' ? 40 : 60) + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name={TabName.Index}
        options={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather name="home" size={26} color={color} />,
        }}
      />

      <Tabs.Screen
        name={TabName.Explore}
        options={{
          tabBarShowLabel: false,
          headerShown: true,
          tabBarIcon: ({ color }) => <Feather name="compass" size={26} color={color} />,
        }}
      />

      <Tabs.Screen
        name={TabName.Camera}
        options={{
          tabBarShowLabel: false,
          headerShown: true,
          tabBarIcon: ({ color }) => <Feather name="camera" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name={TabName.Notifications}
        options={{
          tabBarShowLabel: false,
          headerShown: true,
          tabBarIcon: ({ color }) => <Feather name="bell" size={26} color={color} />,
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