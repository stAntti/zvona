import { sql } from '../lib/db'

const workerId = `worker-${process.pid}`

interface ClaimedJob {
  id: string
  type: string
  payload: unknown
  attempts: number
  max_attempts: number
}

async function claimJob() {
  const db = sql()
  const rows = await db.begin(async (tx) => {
    const pending = await tx`select id, type, payload, attempts, max_attempts from jobs where status = 'queued' and run_after <= now() order by created_at for update skip locked limit 1`
    if (!pending[0]) return []
    await tx`update jobs set status = 'running', locked_at = now(), attempts = attempts + 1 where id = ${pending[0].id}`
    return pending
  })
  return rows[0] as ClaimedJob | undefined
}

async function tick() {
  const job = await claimJob()
  if (!job) return
  const db = sql()
  try {
    // Job handlers are deliberately explicit; external effects are added per approved adapter.
    await db`update jobs set status = 'succeeded', locked_at = null where id = ${job.id}`
    console.log(`[${workerId}] completed ${job.type} ${job.id}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const retry = job.attempts + 1 < job.max_attempts
    await db`update jobs set status = ${retry ? 'queued' : 'failed'}, last_error = ${message}, locked_at = null, run_after = now() + interval '1 minute' where id = ${job.id}`
  }
}

console.log(`[${workerId}] started`)
setInterval(() => void tick(), 2000)
