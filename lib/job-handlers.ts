import { z } from 'zod'
import type { Sql } from 'postgres'
import { fetchPublicText } from './safe-fetch'
import { researchWithOpenAI } from './ai'
import { cleanupExpiredArtifacts } from './object-store'

const researchJob=z.object({accountId:z.string().uuid(),url:z.string().url()})
const draftJob=z.object({taskId:z.string().uuid(),channel:z.enum(['email_draft','whatsapp_draft']),recipient:z.string(),allowedClaims:z.array(z.string()),forbiddenClaims:z.array(z.string())})
const qaJob=z.object({taskId:z.string().uuid(),transcript:z.string().min(10),loggedOutcome:z.string(),mandatoryQuestions:z.array(z.string())})
export type SupportedJob='research.account'|'draft.prepare'|'qa.review'

export async function handleJob(db:Sql,job:{id:string;organizationId:string;type:string;payload:unknown}){
  if(job.type==='artifact.cleanup')return cleanupExpiredArtifacts()
  if(job.type==='research.account'){
    const payload=researchJob.parse(job.payload);const source=await fetchPublicText(payload.url);const output=await researchWithOpenAI(source.text)
    const rows=await db<Array<{profile:Record<string,unknown>}>>`select profile from accounts where id=${payload.accountId} and organization_id=${job.organizationId}`;if(!rows[0])throw new Error('Account not found in organization')
    const profile={...rows[0].profile,research:output,researchSource:{url:source.url,retrievedAt:source.retrievedAt}}
    await db`update accounts set profile=${db.json(profile)} where id=${payload.accountId} and organization_id=${job.organizationId}`
    await db`insert into ai_runs(organization_id,task_type,model,prompt_version,source_refs,structured_output) values(${job.organizationId},'research.account',${process.env.OPENAI_MODEL??'gpt-5.4-mini'},'research-v1',${db.json([{url:source.url,retrievedAt:source.retrievedAt}])},${db.json(output)})`
    return {accountId:payload.accountId,confidence:output.confidence}
  }
  if(job.type==='draft.prepare'){
    const payload=draftJob.parse(job.payload);const task=await db<Array<{card_snapshot:Record<string,unknown>}>>`select card_snapshot from tasks where id=${payload.taskId} and organization_id=${job.organizationId}`;if(!task[0])throw new Error('Task not found in organization')
    const claim=payload.allowedClaims[0]??'обсудить задачу';const text=payload.channel==='email_draft'?`Здравствуйте. Предлагаем ${claim.toLowerCase()}. Подскажите, кто отвечает за эту задачу?`:`Здравствуйте. Подскажите, кто в компании отвечает за эту задачу?`
    const result={channel:payload.channel,recipient:payload.recipient,text,status:'draft_only',claimsUsed:payload.allowedClaims.slice(0,1)}
    await db`update tasks set outcome=coalesce(outcome,'{}'::jsonb)||${db.json({draft:result})}::jsonb where id=${payload.taskId} and organization_id=${job.organizationId}`
    return result
  }
  if(job.type==='qa.review'){
    const payload=qaJob.parse(job.payload);const lower=payload.transcript.toLowerCase();const covered=payload.mandatoryQuestions.filter(q=>lower.includes(q.toLowerCase().split(' ')[0])).length;const score=Math.round(60+40*(covered/Math.max(1,payload.mandatoryQuestions.length)));const result={score,validity:score>=75?'VALID':'REVIEW_REQUIRED',loggedOutcome:payload.loggedOutcome,coveredQuestions:covered,redFlags:[]}
    await db`update tasks set outcome=coalesce(outcome,'{}'::jsonb)||${db.json({qa:result})}::jsonb where id=${payload.taskId} and organization_id=${job.organizationId}`
    return result
  }
  throw new Error(`Unsupported job type: ${job.type}`)
}
