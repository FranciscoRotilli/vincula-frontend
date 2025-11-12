import { beforeEach, describe, expect, it, vi } from 'vitest'

const { nextSpy, redirectSpy } = vi.hoisted(() => ({
  nextSpy: vi.fn(() => ({ kind: 'NEXT' })),
  redirectSpy: vi.fn((url: URL | string) => ({
    kind: 'REDIRECT',
    url: String(url),
  })),
}))

vi.mock('next/server', () => ({
  NextResponse: {
    next: nextSpy,
    redirect: redirectSpy,
  },
}))

import { config,middleware } from '@/middleware'

function makeReq(pathname: string, cookieValue?: string) {
  const url = `https://app.example.com${pathname}`
  return {
    url,
    nextUrl: new URL(url),
    cookies: {
      get: (name: string) =>
        name === 'access_token' && cookieValue !== undefined
          ? { name, value: cookieValue }
          : undefined,
    },
  } as any
}

describe('middleware', () => {
  beforeEach(() => {
    nextSpy.mockClear()
    redirectSpy.mockClear()
  })

  it('passes through unprotected paths', () => {
    const res = middleware(makeReq('/public'))
    expect(nextSpy).toHaveBeenCalledTimes(1)
    expect(redirectSpy).not.toHaveBeenCalled()
    expect(res).toEqual({ kind: 'NEXT' })
  })

  it('allows protected path when access_token exists', () => {
    const res = middleware(makeReq('/casos', 'token-123'))
    expect(nextSpy).toHaveBeenCalledTimes(1)
    expect(redirectSpy).not.toHaveBeenCalled()
    expect(res).toEqual({ kind: 'NEXT' })
  })

  it('redirects protected path when access_token is missing', () => {
    const res = middleware(makeReq('/casos'))
    expect(nextSpy).not.toHaveBeenCalled()
    expect(redirectSpy).toHaveBeenCalledTimes(1)

    const [urlArg] = redirectSpy.mock.calls[0]
    const u = new URL(String(urlArg))
    expect(u.origin + u.pathname).toBe('https://app.example.com/')
    expect(u.searchParams.get('next')).toBe('/casos')
    expect(res).toEqual({ kind: 'REDIRECT', url: String(urlArg) })
  })

  it("treats literal 'undefined' cookie value as missing and redirects", () => {
    const res = middleware(makeReq('/casos', 'undefined'))
    expect(nextSpy).not.toHaveBeenCalled()
    expect(redirectSpy).toHaveBeenCalledTimes(1)

    const [urlArg] = redirectSpy.mock.calls[0]
    const u = new URL(String(urlArg))
    expect(u.origin + u.pathname).toBe('https://app.example.com/')
    expect(u.searchParams.get('next')).toBe('/casos')
    expect(res).toEqual({ kind: 'REDIRECT', url: String(urlArg) })
  })

  it('protects subpaths under /casos', () => {
    middleware(makeReq('/casos/123/itens'))
    expect(redirectSpy).toHaveBeenCalledTimes(1)

    const [urlArg] = redirectSpy.mock.calls[0]
    const u = new URL(String(urlArg))
    expect(u.origin + u.pathname).toBe('https://app.example.com/')
    expect(u.searchParams.get('next')).toBe('/casos/123/itens')
  })

  it('exports expected config.matcher', () => {
    expect(config).toBeDefined()
    expect(config.matcher).toEqual(['/((?!_next/static|_next/image|favicon.ico).*)'])
  })
})
