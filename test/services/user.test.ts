import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getUsers } from '../../src/services/userService'

vi.stubGlobal('fetch', vi.fn())

describe('userService > getUsers', () => {
  const token = 'test-access-token'

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('access_token', token)
  })

  it('GETs /api/user/ with correct headers and returns parsed JSON on success', async () => {
    const payload = [
      { id: 'u1', username: 'alice', role: 'admin' },
      { id: 'u2', username: 'bob', role: 'user' },
    ]

    const json = vi.fn().mockResolvedValue(payload)
    ;(fetch as unknown as vi.Mock).mockResolvedValue({ ok: true, json })

    const result = await getUsers()

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith('/api/user/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    expect(json).toHaveBeenCalledTimes(1)
    expect(result).toEqual(payload)
  })

  it('throws with statusText when response is not ok', async () => {
    ;(fetch as unknown as vi.Mock).mockResolvedValue({
      ok: false,
      statusText: 'Forbidden',
    })

    await expect(getUsers()).rejects.toThrow(
      'Falha ao adicionar suspeito: Forbidden'
    )
  })

  it('still sends Authorization header when token is missing (Bearer null)', async () => {
    localStorage.removeItem('access_token')

    const payload = [{ id: 'u3', username: 'charlie', role: 'viewer' }]
    const json = vi.fn().mockResolvedValue(payload)
    ;(fetch as unknown as vi.Mock).mockResolvedValue({ ok: true, json })

    const result = await getUsers()

    expect(fetch).toHaveBeenCalledTimes(1)
    const [, init] = (fetch as unknown as vi.Mock).mock.calls[0]
    expect(init).toMatchObject({
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer null',
      },
    })
    expect(result).toEqual(payload)
  })

  it('bubbles JSON parse error when response.ok is true but body is invalid', async () => {
    const jsonErr = new Error('invalid json')
    const json = vi.fn().mockRejectedValue(jsonErr)
    ;(fetch as unknown as vi.Mock).mockResolvedValue({ ok: true, json })

    await expect(getUsers()).rejects.toThrow(jsonErr)
    expect(json).toHaveBeenCalledTimes(1)
  })
})
