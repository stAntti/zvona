import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json({ status: 'ok', database: Boolean(process.env.DATABASE_URL), openai: Boolean(process.env.OPENAI_API_KEY) })
}
