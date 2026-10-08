import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as WebBrowser from 'expo-web-browser'
import { act, create } from 'jest-expo/node_modules/react-test-renderer'
import SignupScreen from '../src/app/(public)/handleSignup'
import { getRegisterServers } from '../src/lib/api'

// Expo's renderer must share the app's React instance, not its nested RSC React build.
jest.mock('jest-expo/node_modules/react', () => jest.requireActual('react'))
jest.mock('../src/lib/api', () => ({ getRegisterServers: jest.fn() }))
jest.mock('../src/utils', () => ({ prettyCount: String }))
const mockPush = jest.fn()
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }))
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn().mockResolvedValue({ type: 'dismiss' }),
  openAuthSessionAsync: jest.fn().mockResolvedValue({ type: 'cancel' }),
}))
jest.mock('@expo/vector-icons/Feather', () => 'Icon')
jest.mock('tamagui', () => ({
  ...Object.fromEntries(
    ['Button', 'Image', 'Input', 'ScrollView', 'Text', 'View', 'XStack', 'YStack'].map(
      (name) => [name, name]
    )
  ),
  useTheme: () => ({}),
}))

let screen
let client

async function renderSignup() {
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  })
  await act(async () => {
    screen = create(
      <QueryClientProvider client={client}>
        <SignupScreen />
      </QueryClientProvider>
    )
  })
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20))
  })
}

function button(label) {
  return screen.root.findAllByType('Button').find((node) => node.props.children === label)
}

afterEach(() => {
  if (screen) act(() => screen.unmount())
  client?.clear()
  jest.clearAllMocks()
})

test('a failed server directory still lets someone register on their own server', async () => {
  getRegisterServers.mockRejectedValue(new Error('HTTP 404'))
  await renderSignup()

  const input = screen.root.findByProps({ accessibilityLabel: 'Server domain' })
  act(() => input.props.onChangeText('photos.example.org'))
  const signup = button('Sign Up on photos.example.org')
  expect(signup).toBeDefined()
  await act(async () => signup.props.onPress())
  expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
    'https://photos.example.org/register'
  )
  expect(WebBrowser.openAuthSessionAsync).not.toHaveBeenCalled()
  act(() => {
    let login = screen.root
      .findAllByType('Text')
      .find((node) => node.props.children === 'Log In')
    while (!login.props.onPress) login = login.parent
    login.props.onPress()
  })
  expect(mockPush).toHaveBeenCalledWith({
    pathname: '/handleLogin',
    params: { server: 'photos.example.org' },
  })
})

test.each([
  ['empty', []],
  ['still loading', new Promise(() => {})],
])('manual registration is available when the directory is %s', async (_label, data) => {
  getRegisterServers.mockReturnValue(data)
  await renderSignup()
  act(() =>
    screen.root
      .findByProps({ accessibilityLabel: 'Server domain' })
      .props.onChangeText(' HTTPS://Photos.Example.org/ ')
  )
  await act(async () => button('Sign Up on photos.example.org').props.onPress())
  expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
    'https://photos.example.org/register'
  )
})

test.each([
  '',
  'not a domain',
  'photos.example.org/path',
  'photos.example.org@evil.example',
])('invalid input %j clears the previously selected server', async (input) => {
  getRegisterServers.mockResolvedValue([])
  await renderSignup()
  const field = screen.root.findByProps({ accessibilityLabel: 'Server domain' })
  act(() => field.props.onChangeText('photos.example.org'))
  act(() => field.props.onChangeText(input))
  expect(screen.root.findAllByType('Button')).toHaveLength(0)
  expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled()
})

test('selecting a listed server after manual entry retains in-app registration', async () => {
  getRegisterServers.mockResolvedValue([{ domain: 'listed.example.org', user_count: 10 }])
  await renderSignup()
  act(() =>
    screen.root
      .findByProps({ accessibilityLabel: 'Server domain' })
      .props.onChangeText('photos.example.org')
  )
  act(() => screen.root.findAllByProps({ accessibilityRole: 'radio' })[0].props.onPress())
  expect(
    screen.root.findByProps({ accessibilityLabel: 'Server domain' }).props.value
  ).toBe('')
  await act(async () => button('Sign Up on listed.example.org').props.onPress())
  expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalledWith(
    'https://listed.example.org/i/app-email-verify',
    'pixelfed://verifyEmail'
  )
  expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled()
})
