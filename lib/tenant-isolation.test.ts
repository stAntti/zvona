import { beforeEach, describe, expect, it, vi } from 'vitest'

const { requirePilotSession, loadPilotState, createRoutedTask, completeTask, listTasks } = vi.hoisted(() => ({
  requirePilotSession: vi.fn(), loadPilotState: vi.fn(), createRoutedTask: vi.fn(), completeTask: vi.fn(), listTasks: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ requirePilotSession }))
vi.mock('@/lib/repository', () => ({ loadPilotState }))
vi.mock('@/lib/task-repository', () => ({ createRoutedTask, completeTask, listTasks }))

import { GET as getState } from '@/app/api/pilot/state/route'
import { POST as mutateTask } from '@/app/api/pilot/tasks/route'

describe('tenant isolation at API boundaries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requirePilotSession.mockResolvedValue({ userId: 'user-a', organizationId: 'org-a', email: 'a@example.test', role: 'operator' })
  })

  it('loads state only with the organization from the authenticated session', async () => {
    loadPilotState.mockResolvedValue({ organizationId: 'org-a', campaign: {}, accounts: [] })
    const response = await getState()
    expect(response.status).toBe(200)
    expect(loadPilotState).toHaveBeenCalledOnce()
    expect(loadPilotState).toHaveBeenCalledWith('org-a')
  })

  it('does not accept an organization id supplied by a task completion request', async () => {
    completeTask.mockResolvedValue({ outcome: 'qualified', nextAction: 'route_to_ae' })
    const request = new Request('http://localhost/api/pilot/tasks', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'complete', organizationId: 'org-b', taskId: '00000000-0000-4000-8000-000000000001', outcome: 'qualified', notes: '', evidence: { decisionMaker: true, activeNeed: true, agreedNextStep: true } }),
    })
    const response = await mutateTask(request)
    expect(response.status).toBe(200)
    expect(completeTask).toHaveBeenCalledWith('org-a', '00000000-0000-4000-8000-000000000001', expect.objectContaining({ outcome: 'qualified' }))
    expect(completeTask).not.toHaveBeenCalledWith('org-b', expect.anything(), expect.anything())
  })

  it('returns an error when the scoped repository cannot see another tenant task', async () => {
    completeTask.mockRejectedValue(new Error('Task unavailable'))
    const request = new Request('http://localhost/api/pilot/tasks', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'complete', taskId: '00000000-0000-4000-8000-000000000002', outcome: 'qualified', notes: '', evidence: { decisionMaker: true, activeNeed: true, agreedNextStep: true } }),
    })
    const response = await mutateTask(request)
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Task unavailable' })
  })
})
