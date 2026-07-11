import postgres from 'postgres'

let client: ReturnType<typeof postgres> | null = null

export function sql() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured')
  client ??= postgres(process.env.DATABASE_URL, { max: 5, idle_timeout: 20 })
  return client
}
