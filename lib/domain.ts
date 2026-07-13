export type ReadinessBand = 'blocked' | 'review' | 'ready'
export type Channel = 'manual_call' | 'email_draft' | 'whatsapp_draft' | 'manual_research' | 'manual_review'
export type Executor = 'ai_nurture' | 'junior_operator' | 'senior_operator' | 'account_executive' | 'researcher'
export type PolicyStatus = 'eligible' | 'draft_only' | 'consent_required' | 'suppressed' | 'blocked_by_campaign' | 'unsupported'
export type ContactSourceType = 'csv' | 'company_website' | 'public_contact_page' | 'manual'
export type ConsentStatus = 'unknown' | 'granted' | 'revoked'
export type NextAction = 'retry_call' | 'prepare_email' | 'prepare_whatsapp' | 'wait_for_reply' | 'nurture' | 'request_research' | 'escalate_to_senior' | 'route_to_ae' | 'suppress' | 'disqualify'

export interface Campaign {
  id: string
  organizationId: string
  name: string
  offer: string
  icp: string
  personas: string[]
  qualificationDefinition: string
  allowedClaims: string[]
  forbiddenClaims: string[]
  objections: string[]
  mandatoryLogging: string[]
  enabledChannels: Channel[]
  assignedExecutors: Executor[]
  budget: number
}

export interface ContactPoint {
  id: string
  type: 'email' | 'phone'
  value: string
  sourceType: ContactSourceType
  sourceLabel: string
  discoveredAt: string
  confidence: number
  consent: ConsentStatus
  suppressed: boolean
}

export interface Account {
  id: string
  organizationId: string
  externalId: string
  name: string
  domain: string
  industry: string
  employeeCount?: number
  region: string
  language: string
  icpFit: boolean
  triggers: string[]
  persona: string
  personaConfidence: number
  potential: number
  contacts: ContactPoint[]
  bin?: string
  oked?: string
  employeeRange?: string
  city?: string
  address?: string
  leaderName?: string
  registrationDate?: string
  aiSummary?: string
  unknowns?: string[]
}

export interface ScoreResult {
  score: number
  band: ReadinessBand
  factors: { label: string; passed: boolean; points: number }[]
}

export interface RoutingDecision {
  channel: Channel
  executor: Executor
  ruleId: string
  reason: string
  policy: PolicyStatus
}

export interface QualificationEvidence {
  decisionMaker: boolean
  activeNeed: boolean
  agreedNextStep: boolean
}

export interface TaskCard {
  id: string
  version: number
  accountId: string
  channel: Channel
  executor: Executor
  goal: string
  offer: string
  whyAccount: string[]
  personaSummary: string
  contact: ContactPoint | null
  allowedClaims: string[]
  forbiddenClaims: string[]
  mandatoryQuestions: string[]
  objections: string[]
  channelGuidance: string
  nextStepRules: string[]
  mandatoryLogging: string[]
  escalationRules: string[]
}

const band = (score: number): ReadinessBand => score >= 75 ? 'ready' : score >= 50 ? 'review' : 'blocked'

export function calculateCampaignReadiness(campaign: Campaign): ScoreResult {
  const checks = [
    ['Offer сформулирован', campaign.offer.trim().length >= 20, 15],
    ['ICP описан', campaign.icp.trim().length >= 20, 15],
    ['Persona определена', campaign.personas.length > 0, 10],
    ['Qualification definition задан', campaign.qualificationDefinition.trim().length >= 15, 15],
    ['Claims подтверждены', campaign.allowedClaims.length > 0, 10],
    ['Запреты зафиксированы', campaign.forbiddenClaims.length > 0, 10],
    ['Возражения подготовлены', campaign.objections.length >= 2, 10],
    ['Логирование определено', campaign.mandatoryLogging.length >= 3, 5],
    ['Каналы включены', campaign.enabledChannels.length > 0, 5],
    ['Исполнители назначены', campaign.assignedExecutors.length > 0, 5],
  ] as const
  const factors = checks.map(([label, passed, points]) => ({ label, passed, points: passed ? points : 0 }))
  const score = factors.reduce((sum, factor) => sum + factor.points, 0)
  const criticalReady = Boolean(campaign.offer.trim() && campaign.icp.trim() && campaign.qualificationDefinition.trim() && campaign.allowedClaims.length && campaign.forbiddenClaims.length)
  return { score, band: criticalReady ? band(score) : 'blocked', factors }
}

export function calculateAccountReadiness(account: Account): ScoreResult {
  const contact = account.contacts.find((item) => !item.suppressed)
  const checks = [
    ['Соответствует ICP', account.icpFit, 25],
    ['Firmographics заполнены', Boolean(account.industry && account.employeeCount && account.region), 15],
    ['Есть trigger signals', account.triggers.length > 0, 15],
    ['Есть доступный контакт', Boolean(contact), 20],
    ['Persona подтверждена', account.personaConfidence >= 0.7, 15],
    ['Контакт не suppressed', Boolean(contact && !contact.suppressed), 10],
  ] as const
  const factors = checks.map(([label, passed, points]) => ({ label, passed, points: passed ? points : 0 }))
  const score = factors.reduce((sum, factor) => sum + factor.points, 0)
  return { score, band: band(score), factors }
}

export function channelPolicy(campaignReady: boolean, channel: Channel, contact?: ContactPoint): PolicyStatus {
  if (!campaignReady) return 'blocked_by_campaign'
  if (contact?.suppressed || contact?.consent === 'revoked') return 'suppressed'
  if (channel === 'email_draft' || channel === 'whatsapp_draft') return 'draft_only'
  if (channel === 'manual_call' && contact?.type !== 'phone') return 'unsupported'
  return 'eligible'
}

export function routeAccount(campaign: Campaign, account: Account): RoutingDecision {
  const campaignScore = calculateCampaignReadiness(campaign)
  const accountScore = calculateAccountReadiness(account)
  if (campaignScore.band !== 'ready') return { channel: 'manual_review', executor: 'researcher', ruleId: 'R-001', reason: 'Кампания не прошла readiness gate', policy: 'blocked_by_campaign' }
  if (accountScore.band !== 'ready') return { channel: 'manual_research', executor: 'researcher', ruleId: 'R-002', reason: 'Нужно дополнить сведения об аккаунте', policy: 'eligible' }
  const activeContacts = account.contacts.filter((item) => !item.suppressed && item.consent !== 'revoked')
  const phone = activeContacts.find((item) => item.type === 'phone')
  const email = activeContacts.find((item) => item.type === 'email')
  if (account.potential >= 5_000_000) return { channel: phone ? 'manual_call' : 'manual_review', executor: 'senior_operator', ruleId: 'R-003', reason: 'Высокий потенциал требует опытного оператора', policy: phone ? 'eligible' : 'unsupported' }
  if (phone) return { channel: 'manual_call', executor: 'junior_operator', ruleId: 'R-004', reason: 'Аккаунт готов и найден рабочий телефон', policy: 'eligible' }
  if (email) return { channel: 'email_draft', executor: 'ai_nurture', ruleId: 'R-005', reason: 'Доступен корпоративный email, создаём черновик', policy: 'draft_only' }
  return { channel: 'manual_research', executor: 'researcher', ruleId: 'R-006', reason: 'Нет доступного контакта', policy: 'eligible' }
}

export const isQualifiedSql = (evidence: QualificationEvidence) => evidence.decisionMaker && evidence.activeNeed && evidence.agreedNextStep

export function recommendNextAction(outcome: string, evidence: QualificationEvidence, suppressed = false): NextAction {
  if (suppressed || outcome === 'opt_out') return 'suppress'
  if (isQualifiedSql(evidence)) return 'route_to_ae'
  if (outcome === 'callback') return 'retry_call'
  if (outcome === 'send_email') return 'prepare_email'
  if (outcome === 'send_whatsapp') return 'prepare_whatsapp'
  if (outcome === 'wrong_person') return 'request_research'
  if (outcome === 'not_relevant') return 'disqualify'
  return 'nurture'
}

export function createTaskCard(campaign: Campaign, account: Account, route: RoutingDecision): TaskCard {
  const contactType = route.channel === 'email_draft' ? 'email' : 'phone'
  const contact = account.contacts.find((item) => item.type === contactType && !item.suppressed) ?? null
  return {
    id: `task-${account.id}`,
    version: 1,
    accountId: account.id,
    channel: route.channel,
    executor: route.executor,
    goal: 'Выявить ЛПР, подтвердить потребность и согласовать следующий шаг',
    offer: campaign.offer,
    whyAccount: account.triggers.length ? account.triggers : ['Соответствует ICP кампании'],
    personaSummary: `${account.persona}. Уверенность гипотезы ${Math.round(account.personaConfidence * 100)}%.`,
    contact,
    allowedClaims: campaign.allowedClaims,
    forbiddenClaims: campaign.forbiddenClaims,
    mandatoryQuestions: ['Как сейчас решаете эту задачу?', 'Кто участвует в выборе?', 'Какой срок и ориентир бюджета?'],
    objections: campaign.objections,
    channelGuidance: route.reason,
    nextStepRules: ['Встреча: ЛПР + потребность + согласованный слот', 'Follow-up: есть интерес, но нет срока', 'Disqualify: нет ICP fit'],
    mandatoryLogging: campaign.mandatoryLogging,
    escalationRules: ['Потенциал выше 5 млн ₸', 'Юридический или compliance вопрос', 'Запрос нестандартной скидки'],
  }
}

export function toCrmCsv(rows: Array<{ account: Account; route: RoutingDecision; outcome?: string; nextAction?: NextAction }>) {
  const header = ['external_account_id','account_name','readiness','priority','contact_source','channel','channel_policy','outcome','next_best_action']
  const escape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`
  const lines = rows.map(({ account, route, outcome = '', nextAction = '' }) => [
    account.externalId, account.name, calculateAccountReadiness(account).score,
    account.potential >= 5_000_000 ? 'A' : account.icpFit ? 'B' : 'D',
    account.contacts[0]?.sourceType ?? '', route.channel, route.policy, outcome, nextAction,
  ].map(escape).join(','))
  return [header.join(','), ...lines].join('\n')
}
