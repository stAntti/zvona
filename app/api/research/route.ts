import { NextResponse } from 'next/server'
import { z } from 'zod'
import { researchWithOpenAI } from '@/lib/ai'

const requestSchema = z.object({ sourceText: z.string().min(50).max(40_000) })

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json())
    return NextResponse.json(await researchWithOpenAI(body.sourceText))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Research failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
