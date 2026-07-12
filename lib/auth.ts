import { createHash, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { sql } from './db'

export const SESSION_COOKIE = 'zvona_pilot_session'
const hash = (value: string) => createHash('sha256').update(value).digest('hex')
export interface PilotSession { userId: string; organizationId: string; email: string; role: string }

export async function redeemInvite(rawToken: string) {
  const db = sql(); const tokenHash = hash(rawToken)
  return db.begin(async (tx) => {
    const rows = await tx<Array<{ id:string; organization_id:string; email:string; role:string }>>`select id,organization_id,email,role from pilot_invites where token_hash=${tokenHash} and used_at is null and expires_at>now() for update`
    const invite=rows[0]; if(!invite) throw new Error('INVALID_INVITE')
    const users=await tx<Array<{id:string}>>`insert into users(email,name) values(${invite.email},${invite.email.split('@')[0]}) on conflict(email) do update set email=excluded.email returning id`
    const userId=users[0].id
    await tx`insert into memberships(organization_id,user_id,role) values(${invite.organization_id},${userId},${invite.role}) on conflict(organization_id,user_id) do update set role=excluded.role`
    const sessionToken=randomBytes(32).toString('base64url')
    await tx`insert into pilot_sessions(organization_id,user_id,token_hash,expires_at) values(${invite.organization_id},${userId},${hash(sessionToken)},now()+interval '7 days')`
    await tx`update pilot_invites set used_at=now() where id=${invite.id}`
    return {sessionToken,session:{userId,organizationId:invite.organization_id,email:invite.email,role:invite.role} satisfies PilotSession}
  })
}

export async function getPilotSession(): Promise<PilotSession|null> {
  const token=(await cookies()).get(SESSION_COOKIE)?.value; if(!token) return null
  const rows=await sql()<PilotSession[]>`select s.user_id as "userId",s.organization_id as "organizationId",u.email,m.role from pilot_sessions s join users u on u.id=s.user_id join memberships m on m.user_id=s.user_id and m.organization_id=s.organization_id where s.token_hash=${hash(token)} and s.revoked_at is null and s.expires_at>now() limit 1`
  return rows[0]??null
}
export async function requirePilotSession(){const session=await getPilotSession();if(!session)throw new Error('UNAUTHORIZED');return session}
