import { createHash, randomUUID } from 'node:crypto'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import { sql } from './db'

const limits = { csv: 5_000_000, audio: 25_000_000, transcript: 2_000_000 } as const
export type ArtifactKind = keyof typeof limits
const storageRoot = () => (process.env.OBJECT_STORAGE_PATH ?? '/tmp/zvona-objects').replace(/[\\/]+$/, '')
const safeSegment = (value: string) => { if (!/^[a-f0-9-]{36}$/.test(value)) throw new Error('Unsafe storage segment'); return value }

export async function storeArtifact(org: string, kind: ArtifactKind, file: File) {
  if (file.size > limits[kind]) throw new Error('File exceeds size limit')
  const allowed = kind === 'csv' ? ['text/csv', 'application/vnd.ms-excel'] : kind === 'audio' ? ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/mp4'] : ['text/plain', 'application/json']
  if (!allowed.includes(file.type)) throw new Error('Unsupported content type')
  const bytes = new Uint8Array(await file.arrayBuffer()); const id = randomUUID(); const root = storageRoot(); const dir = `${root}/${safeSegment(org)}`
  await mkdir(dir, { recursive: true }); const key = `${org}/${id}`; await writeFile(`${dir}/${id}`, bytes, { flag: 'wx' })
  const hash = createHash('sha256').update(bytes).digest('hex'); const days = kind === 'audio' ? 30 : kind === 'transcript' ? 90 : 14
  await sql()`insert into artifacts(id,organization_id,kind,storage_key,original_name,content_type,size_bytes,sha256,retention_until) values(${id},${org},${kind},${key},${file.name},${file.type},${file.size},${hash},now()+(${days}||' days')::interval)`
  return { id, kind, name: file.name, size: file.size, sha256: hash, retentionDays: days }
}

export async function cleanupExpiredArtifacts() {
  const db = sql(); const rows = await db<Array<{ id: string; organization_id: string; storage_key: string }>>`select id,organization_id,storage_key from artifacts where deleted_at is null and retention_until<now() limit 100`; const root = storageRoot()
  for (const row of rows) { const [org,id] = row.storage_key.split('/'); const target = `${root}/${safeSegment(org)}/${safeSegment(id)}`; await unlink(target).catch(() => {}); await db`update artifacts set deleted_at=now() where id=${row.id} and organization_id=${row.organization_id}` }
  return { deleted: rows.length }
}
