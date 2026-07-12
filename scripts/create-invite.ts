import { createHash, randomBytes } from 'node:crypto'
import postgres from 'postgres'

const email=process.argv[2]; const role=process.argv[3]??'campaign_manager'; const slug=process.argv[4]??'northstar-gifts-kz'
if(!email||!email.includes('@')){console.error('Usage: npm run invite -- user@example.com [role] [organization-slug]');process.exit(1)}
if(!process.env.DATABASE_URL){console.error('DATABASE_URL is required');process.exit(1)}
const db=postgres(process.env.DATABASE_URL,{max:1});const organizations=await db<Array<{id:string}>>`select id from organizations where slug=${slug}`
if(!organizations[0]){console.error(`Organization ${slug} not found`);await db.end();process.exit(1)}
const token=randomBytes(32).toString('base64url');const tokenHash=createHash('sha256').update(token).digest('hex')
await db`insert into pilot_invites(organization_id,email,role,token_hash,expires_at) values(${organizations[0].id},${email},${role},${tokenHash},now()+interval '24 hours')`
console.log(`Invite code for ${email} (expires in 24h):\n${token}`)
await db.end()
