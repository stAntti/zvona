import { beforeEach, describe, expect, it, vi } from 'vitest'

const { redeemInvite } = vi.hoisted(() => ({ redeemInvite: vi.fn() }))
vi.mock('@/lib/auth', () => ({
  SESSION_COOKIE: 'zvona_pilot_session',
  redeemInvite,
}))

import { POST } from '@/app/api/auth/redeem/route'

describe('pilot auth session', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NODE_ENV = 'production'
  })

  it('creates a hardened, seven-day session cookie after invite redemption', async () => {
    redeemInvite.mockResolvedValue({
      sessionToken: 'session-secret',
      session: { userId: 'user-a', organizationId: 'org-a', email: 'operator@example.test', role: 'operator' },
    })
    const response = await POST(new Request('http://localhost/api/auth/redeem', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: 'a'.repeat(32) }),
    }))
    const cookie = response.headers.get('set-cookie') ?? ''
    expect(response.status).toBe(200)
    expect(cookie).toContain('zvona_pilot_session=session-secret')
    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('SameSite=strict')
    expect(cookie).toContain('Secure')
    expect(cookie).toContain('Max-Age=604800')
  })

  it('does not redeem malformed invite tokens or create a cookie', async () => {
    const response = await POST(new Request('http://localhost/api/auth/redeem', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: 'short' }),
    }))
    expect(response.status).toBe(401)
    expect(redeemInvite).not.toHaveBeenCalled()
    expect(response.headers.get('set-cookie')).toBeNull()
  })

  it('does not leak invite validation details', async () => {
    redeemInvite.mockRejectedValue(new Error('INVALID_INVITE'))
    const response = await POST(new Request('http://localhost/api/auth/redeem', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: 'b'.repeat(32) }),
    }))
    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Invite is invalid or expired' })
  })
})
