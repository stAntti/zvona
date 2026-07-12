import { sql } from '../lib/db'
import { handleJob } from '../lib/job-handlers'

const workerId = `worker-${process.pid}`

interface ClaimedJob {
  id: string
  type: string
  payload: unknown
  organization_id: string
  attempts: number
  max_attempts: number
}

async function claimJob() {
  const db = sql()
  const rows = await db.begin(async (tx) => {
    const pending = await tx`select id, organization_id, type, payload, attempts, max_attempts from jobs where status = 'queued' and run_after <= now() order by created_at for update skip locked limit 1`
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
    const result=await handleJob(db,{id:job.id,organizationId:job.organization_id,type:job.type,payload:job.payload})
    await db`insert into audit_events(organization_id,action,entity_type,entity_id,metadata) values(${job.organization_id},'job.succeeded','job',${job.id},${db.json({type:job.type,result})})`
    await db`update jobs set status = 'succeeded', locked_at = null where id = ${job.id}`
    console.log(`[${workerId}] completed ${job.type} ${job.id}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const retry = job.attempts + 1 < job.max_attempts
    await db`update jobs set status = ${retry ? 'queued' : 'failed'}, last_error = ${message}, locked_at = null, run_after = now() + interval '1 minute' where id = ${job.id}`
    await db`insert into audit_events(organization_id,action,entity_type,entity_id,metadata) values(${job.organization_id},${retry?'job.retry':'job.failed'},'job',${job.id},${db.json({type:job.type,error:message})})`
  }
}

console.log(`[${workerId}] started`)
setInterval(() => void tick(), 2000)
