export type Role = 'operator' | 'campaign_manager' | 'quality_controller' | 'sales_manager'
export type CompanyStatus = 'queued' | 'prepared' | 'called' | 'interested'
export type Priority = 'high' | 'medium' | 'low'
export type OutcomeType = 'interested' | 'proposal' | 'callback' | 'supplier_selected' | 'other_contact' | 'not_relevant' | 'wrong_contact' | 'no_answer'
export type CallValidity = 'VALID' | 'REVIEW_REQUIRED' | 'INVALID'

export interface Campaign {
  id: string
  name: string
  goal: string
  period: string
  baseCallRate: number
  outcomeBonuses: Record<OutcomeType, number>
}

export interface Contact {
  name: string
  position: string
  phone: string
}

export interface Company {
  id: string
  name: string
  industry: string
  city: string
  employees: number
  priority: Priority
  priorityReason: string
  status: CompanyStatus
  contact: Contact
  potential: string
  budget: string
  need: string
  risk: string
  lastTouch: string
}

export type EnrichmentStatus = 'READY' | 'PARTIAL' | 'NEEDS_REVIEW'
export type OperatorLevel = 'Начальный' | 'Опытный' | 'Эксперт'

export interface EnrichmentSource {
  id: string
  label: string
  kind: string
  confidence: number
  checkedAt: string
}

export interface EnrichmentProfile {
  companyId: string
  description: string
  regions: string[]
  likelyDecisionMaker: string
  leadScore: number
  potentialValue: string
  status: EnrichmentStatus
  recommendedLevel: OperatorLevel
  signals: string[]
  sources: EnrichmentSource[]
  unknowns: string[]
  confidence: number
}

export interface TranscriptLine {
  speaker: 'operator' | 'client'
  text: string
  time: string
  stage: string
  sayNow: string
  nextQuestion: string
  objection?: string
  answer?: string
  completes?: string
}

export interface QualityItem {
  label: string
  score: number
  weight: number
  note: string
}

export interface Operator {
  id: string
  name: string
  initials: string
  status: 'Онлайн' | 'Перерыв' | 'Офлайн'
  calls: number
  quality: number
  conversion: number
  earned: number
}

export interface KnowledgeBaseEntry {
  question: string
  answer: string
  category1: string
  category2?: string
  category3?: string
}

export interface CallResult {
  outcome: OutcomeType
  quantity: number
  budget: string
  deadline: string
  comment: string
  validity: CallValidity
  invalidReason: string
  decisionMakerName?: string
  decisionMakerRole?: string
  contactValue?: string
  callbackAt?: string
}

export function payoutCoefficient(score: number) {
  if (score < 60) return 0.5
  if (score < 75) return 0.8
  if (score < 90) return 1
  return 1.25
}

export function calculateQualityScore(items: QualityItem[]) {
  return Math.round(items.reduce((sum, item) => sum + item.score * item.weight / 100, 0))
}

export function calculatePayout(baseCallRate: number, score: number, outcomeBonus: number, validity: CallValidity) {
  if (validity === 'INVALID') return 0
  return baseCallRate * payoutCoefficient(score) + outcomeBonus
}

export const formatMoney = (value: number) => `${new Intl.NumberFormat('ru-RU').format(value)} ₸`
