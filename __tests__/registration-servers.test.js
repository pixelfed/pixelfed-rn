import { getRegisterServers } from '../src/lib/api'

jest.mock('../src/requests', () => ({}))
jest.mock('../src/state/cache', () => ({}))
jest.mock('../src/utils', () => ({}))
jest.mock('../src/lib/api-context', () => ({}))
jest.mock('../src/lib/randomKey', () => ({}))

afterEach(() => jest.restoreAllMocks())

test('rejects a failed directory response before attempting to parse it', async () => {
  const json = jest.fn()
  jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 404, json })
  await expect(getRegisterServers()).rejects.toThrow('404')
  expect(json).not.toHaveBeenCalled()
})

test('rejects a directory response that is not a server list', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({ error: 'unavailable' }),
  })
  await expect(getRegisterServers()).rejects.toThrow('Invalid registration server list')
})

test('returns the directory servers', async () => {
  const servers = [{ domain: 'photos.example.org', user_count: 10 }]
  jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => servers })
  await expect(getRegisterServers()).resolves.toEqual(servers)
})
