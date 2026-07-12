import { NextResponse } from 'next/server'
import { z } from 'zod'
import { researchWithOpenAI } from '@/lib/ai'
import { fetchPublicText } from '@/lib/safe-fetch'
import { requirePilotSession } from '@/lib/auth'

const requestSchema = z.union([z.object({ sourceText: z.string().min(50).max(40_000) }),z.object({ url:z.string().url().max(2000) })])

export async function POST(request: Request) {
  try {
    await requirePilotSession()
    const body = requestSchema.parse(await request.json())
    const source='url' in body?await fetchPublicText(body.url):{url:'manual://text',retrievedAt:new Date().toISOString(),text:body.sourceText}
    const research=await researchWithOpenAI(source.text)
    return NextResponse.json({research,source:{url:source.url,retrievedAt:source.retrievedAt}})
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Research failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
