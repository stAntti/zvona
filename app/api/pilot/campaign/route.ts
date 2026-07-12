import { NextResponse } from 'next/server'
import { saveCampaign } from '@/lib/repository'
import { campaignSchema } from '@/lib/validation'
import { requirePilotSession } from '@/lib/auth'

export async function PUT(request: Request) {
  try {
    const { organizationId } = await requirePilotSession()
    const campaign = campaignSchema.parse(await request.json())
    if (campaign.organizationId !== organizationId) return NextResponse.json({ error: 'Organization mismatch' }, { status: 403 })
    return NextResponse.json(await saveCampaign(organizationId, campaign))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save campaign'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
