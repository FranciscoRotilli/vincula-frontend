import { beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  vi.unstubAllGlobals()
  vi.stubGlobal('fetch', vi.fn())
})

async function loadRealAuth() {
  const mod = await vi.importActual<typeof import('@/services/auth')>('@/services/auth')
  return mod
}

describe('auth service', () => {
  describe('login', () => {
    it('POSTs credentials and returns parsed JSON on success', async () => {
      const payload = {
        user: 'testuser',
        role: 'admin',
        access_token: 'mock-access',
        refresh_token: 'mock-refresh',
      }

      ;(fetch as vi.Mock).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(payload),
      })

      const { login } = await loadRealAuth()
      const result = await login('alice', 'secret')

      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'alice', password: 'secret' }),
      })
      expect(result).toEqual(payload)
    })

    it('throws when response not ok', async () => {
      ;(fetch as vi.Mock).mockResolvedValue({ ok: false })

      const { login } = await loadRealAuth()
      await expect(login('alice', 'wrong')).rejects.toThrow('Credenciais inválidas')
    })
  })

  describe('logout', () => {
    it('POSTs to /api/auth/logout', async () => {
      ;(fetch as vi.Mock).mockResolvedValue({ ok: true })

      const { logout } = await loadRealAuth()
      await logout()

      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' })
    })
  })

  describe('getCurrentUser', () => {
    it('GETs /api/me and returns parsed JSON when ok', async () => {
      const me = { username: 'testuser', role: 'admin' }
      ;(fetch as vi.Mock).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(me),
      })

      const { getCurrentUser } = await loadRealAuth()
      const res = await getCurrentUser()

      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch).toHaveBeenCalledWith('/api/me')
      expect(res).toEqual(me)
    })

    it('throws specific error when 401', async () => {
      ;(fetch as vi.Mock).mockResolvedValue({ ok: false, status: 401 })

      const { getCurrentUser } = await loadRealAuth()
      await expect(getCurrentUser()).rejects.toThrow('Failed to get user')
    })

    it('returns null for other non-ok statuses', async () => {
      ;(fetch as vi.Mock).mockResolvedValue({ ok: false, status: 500 })

      const { getCurrentUser } = await loadRealAuth()
      const res = await getCurrentUser()
      expect(res).toBeNull()
    })
  })
})
