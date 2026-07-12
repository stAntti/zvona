import { NextResponse } from 'next/server'
import { ensureDemoPilot, loadPilotState } from '@/lib/repository'

export async function GET() {
  try {
    const { organizationId } = await ensureDemoPilot()
    return NextResponse.json(await loadPilotState(organizationId))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load pilot state'
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
