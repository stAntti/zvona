import { NextResponse } from 'next/server'
import { getAIStatus } from '@/lib/ai'

export function GET() {
  return NextResponse.json({ status: 'ok', database: Boolean(process.env.DATABASE_URL), ai: getAIStatus() })
}
