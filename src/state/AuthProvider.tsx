import { createContext, useCallback, useEffect } from 'react'
import { useContext, useState } from 'react'
import { router, useSegments } from 'expo-router'
import { loginPreflightCheck, postForm, get, verifyCredentials } from 'src/requests'
import * as Linking from 'expo-linking'
import { Storage } from './cache'
import * as WebBrowser from 'expo-web-browser'
import { Platform, Alert } from 'react-native'

import type { ReactNode } from 'react'
import type { Account, LoginUserResponse } from 'src/lib/api-types'
import { useQuery } from '@tanstack/react-query'
import { getAccountById } from 'src/lib/api'

type User = {
  server: string
  token: string
}

type AuthProvider = {
  isLoading: boolean
  user: User | null
  login: (server: string) => Promise<boolean>
  logout: () => void
  // setUser: (newValue: User | null) => void,
  userCache: LoginUserResponse | null
  loadUserCacheFromStorage: () => void
}

function useProtectedRoute(user: User | null, setUser: any, setIsLoading: any) {
  const segments = useSegments()

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = Storage.getString('app.token')
        const server = Storage.getString('app.instance')
        if (token && server && !user) {
          const userInfo = await verifyCredentials(server, token)
          if (userInfo) {
            setUser({
              server: server,
              token: token,
            })
          } else {
            setIsLoading(false)
          }
        }
      } catch (error) {
        setIsLoading(false)
        console.error('Failed to fetch token from MMKV:', error)
      }
    }
    checkToken()

    const inAuthGroup = segments[0] === '(auth)'

    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    if (!user && inAuthGroup) {
      router.replace('/login')
    } else if (user && !inAuthGroup) {
      router.replace('/(auth)/(tabs)/')
    }
  }, [user, segments, setUser, setIsLoading])
}

export const AuthContext = createContext<AuthProvider>({
  isLoading: true,
  user: null,
  login: () => Promise.resolve(false),
  logout: () => {},
  // setUser: (newValue: User|null) => {},
  userCache: null,
  loadUserCacheFromStorage: () => {},
})

export function useAuth() {
  if (!useContext(AuthContext)) {
    // This does not work, because default is an object which js will interpret as true here
    throw new Error('useAuth must be used within a <AuthProvider />')
  }

  return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [userCache, setUserCache] = useState<LoginUserResponse | null>(null)

  const loadUserCacheFromStorage = useCallback(() => {
    let saved = Storage.getString('user.profile')
    setUserCache(saved ? JSON.parse(saved) : null)
  }, [])

  useEffect(
    () => {
      loadUserCacheFromStorage()
    },
    [loadUserCacheFromStorage] /** only run when component is constructed */
  )

  const login = async (server: string) => {
    const precheck = await loginPreflightCheck(server)
    const url = 'https://' + server
    if (!precheck) {
      return false
    }

    const REDIRECT_URI = Linking.createURL('login')
    let app
    const formBody = {
      client_name: 'Pixelfed for ' + (Platform.OS == 'android' ? 'Android' : 'iOS'),
      redirect_uris: REDIRECT_URI,
      scopes: 'read write follow push admin:read admin:write',
      website: 'https://github.com/pixelfed/pixelfed-rn',
    }
    app = await postForm(`${url}/api/v1/apps`, formBody)
      .then((resp: any) => resp.json())
      .then((res: any) => {
        res.instance = server
        let app = res
        Storage.set('app.client_id', app.client_id)
        Storage.set('app.client_secret', app.client_secret)
        Storage.set('app.instance', app.instance)
        Storage.set('app.name', app.name)
        Storage.set('app.redirect_uri', app.redirect_uri)
        return res
      })

    await WebBrowser.openAuthSessionAsync(
      `${url}/oauth/authorize` +
        `?client_id=${app.client_id}` +
        `&scope=read+write+follow+push+admin:read+admin:write` +
        `&redirect_uri=${REDIRECT_URI}` +
        `&response_type=code`,
      REDIRECT_URI,
      { showInRecents: true }
    ).then((res) => {
      if (res.type === 'success') {
        return _loginCallback(res.url)
      }
    })

    return true
  }

  const _loginCallback = async (url: any) => {
    const { path, queryParams } = Linking.parse(url)
    const REDIRECT_URI = Linking.createURL('login')

    if (queryParams?.error) {
      Alert.alert('Error', 'An error occured when attempting to log in.')
      return
    }

    const instance = Storage.getString('app.instance')
    if (!instance) {
      throw new Error('instance missing')
    }
    const api = `https://${instance}`
    const clientId = Storage.getString('app.client_id')
    const clientSecret = Storage.getString('app.client_secret')

    const tokenRequestBody = {
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
      code: queryParams?.code,
      scope: 'read write follow push admin:read admin:write',
    }

    const token = await postForm(`${api}/oauth/token`, tokenRequestBody).then((resp) =>
      resp.json()
    )

    Storage.set('app.token', token.access_token)
    Storage.set('app.refresh_token', token.refresh_token)
    Storage.set('app.token_created_at', token.created_at)
    Storage.set('app.expires_in', token.expires_in)

    const profile: LoginUserResponse = await get(
      `${api}/api/v1/accounts/verify_credentials`,
      token.access_token,
      { _pe: 1 }
    ).then((resp: any) => resp.json())

    Storage.set('user.profile', JSON.stringify(profile))
    setUserCache(profile)

    setUser({
      server: instance,
      token: token.access_token,
    })

    return true
  }

  const logout = () => {
    setIsLoading(true)
    Storage.clearAll()
    setUser(null)
    setUserCache(null)
    setIsLoading(false)
  }

  useProtectedRoute(user, setUser, setIsLoading)

  return (
    <AuthContext.Provider
      value={{ isLoading, user, login, logout, userCache, loadUserCacheFromStorage }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useUserCache() {
  // TODO think about this, aren't there cases where this cache needs to be updated
  // currently it only gets updated when the user logs out and logs in again
  const { userCache } = useContext(AuthContext)
  if (!userCache) {
    throw new Error('Error: user info not available')
  }
  return userCache
}

// this query is preffiled with cached info and will update cache if sth changes
export function useQuerySelfProfile() {
  const { userCache, loadUserCacheFromStorage } = useAuth() // user id will be static, so ideally static stuff should be in seperate context (that react only updates it on logout/login)
  if (!userCache) {
    throw new Error('userCache not set')
  }

  const {
    data: user,
    isFetching,
    isFetchedAfterMount,
  } = useQuery<Account>({
    queryKey: ['profileById', userCache.id],
    queryFn: getAccountById,
    placeholderData: userCache,
  })

  useEffect(() => {
    if (user && isFetchedAfterMount) {
      // if data is new replace it
      Storage.set('user.profile', JSON.stringify({ ...userCache, ...user }))
      loadUserCacheFromStorage()
    }
  }, [user, isFetchedAfterMount])

  return { user, isFetching }
}
