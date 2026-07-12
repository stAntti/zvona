import { NextResponse } from 'next/server'
import { upsertAccounts } from '@/lib/repository'
import { accountImportSchema } from '@/lib/validation'
import { requirePilotSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { organizationId } = await requirePilotSession()
    const payload = accountImportSchema.parse(await request.json())
    if (payload.accounts.some((account) => account.organizationId !== organizationId)) return NextResponse.json({ error: 'Organization mismatch' }, { status: 403 })
    return NextResponse.json(await upsertAccounts(organizationId, payload.campaignId, payload.accounts))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to import accounts'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
