import { NextResponse } from 'next/server'
import { loadPilotState } from '@/lib/repository'
import { requirePilotSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await requirePilotSession()
    return NextResponse.json(await loadPilotState(session.organizationId))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load pilot state'
    return NextResponse.json({ error: message }, { status: message === 'UNAUTHORIZED' ? 401 : 503 })
  }
}
