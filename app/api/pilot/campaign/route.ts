import { NextResponse } from 'next/server'
import { saveCampaign } from '@/lib/repository'
import { campaignSchema } from '@/lib/validation'

export async function PUT(request: Request) {
  try {
    const organizationId = request.headers.get('x-zvona-organization')
    if (!organizationId) return NextResponse.json({ error: 'Organization scope is required' }, { status: 401 })
    const campaign = campaignSchema.parse(await request.json())
    if (campaign.organizationId !== organizationId) return NextResponse.json({ error: 'Organization mismatch' }, { status: 403 })
    return NextResponse.json(await saveCampaign(organizationId, campaign))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save campaign'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
