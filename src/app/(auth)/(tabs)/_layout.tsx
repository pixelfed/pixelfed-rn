import { Feather } from '@expo/vector-icons'
import { useAuth } from '@state/AuthProvider'
import { Redirect, Tabs } from 'expo-router'
import { Platform } from 'react-native'

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
          height: Platform.OS === 'ios' ? 70 : 60,
          paddingBottom: 8,
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
          tabBarAccessibilityLabel: "Home Feed",
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather name="home" size={26} color={color} />,
        }}
      />

      <Tabs.Screen
        name={TabName.Explore}
        options={{
          tabBarAccessibilityLabel: "Explore",
          tabBarShowLabel: false,
          headerShown: true,
          tabBarIcon: ({ color }) => <Feather name="compass" size={23} color={color} />,
        }}
      />

      <Tabs.Screen
        name={TabName.Camera}
        options={{
          tabBarAccessibilityLabel: "New Post",
          tabBarShowLabel: false,
          headerShown: true,
          tabBarIcon: ({ color }) => <Feather name="camera" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name={TabName.Notifications}
        options={{
          tabBarAccessibilityLabel: "Notifications",
          tabBarShowLabel: false,
          headerShown: true,
          tabBarIcon: ({ color }) => <Feather name="bell" size={26} color={color} />,
        }}
      />

      <Tabs.Screen
        name={TabName.Profile}
        options={{
          tabBarAccessibilityLabel: "Profile",
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather name="user" size={26} color={color} />,
        }}
      />
    </Tabs>
  )
}
