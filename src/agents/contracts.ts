import type { CallResult, CallValidity, Campaign, Company, EnrichmentProfile, QualityItem, TranscriptLine } from '../domain'

export interface AgentContext {
  requestId: string
  generatedAt: string
  demoMode: boolean
}

export interface ResearchAgent {
  enrich(company: Company, context: AgentContext): Promise<EnrichmentProfile>
}

export interface SalesStrategy {
  goal: string
  opening: string
  requiredQuestions: string[]
  objections: Array<{ objection: string; recommendedAnswer: string }>
  forbiddenPromises: string[]
  successCriteria: string[]
}

export interface SalesStrategyAgent {
  prepare(campaign: Campaign, company: Company, enrichment: EnrichmentProfile, context: AgentContext): Promise<SalesStrategy>
}

export interface CopilotSuggestion {
  sayNow: string
  nextQuestion: string
  warnings: string[]
  missingInformation: string[]
  completedQuestionIds: string[]
}

export interface LiveCopilotAgent {
  suggest(transcript: TranscriptLine[], strategy: SalesStrategy, context: AgentContext): Promise<CopilotSuggestion>
}

export interface QualityAgentResult {
  score: number
  criteria: QualityItem[]
  validity: CallValidity
  invalidReason?: string
  strengths: string[]
  improvements: string[]
}

export interface QualityAgent {
  evaluate(campaign: Campaign, transcript: TranscriptLine[], result: CallResult, context: AgentContext): Promise<QualityAgentResult>
}

export interface LeadAssignment {
  companyId: string
  operatorId: string
  priority: number
  reason: string
}

export interface CampaignManagerAgent {
  prioritize(campaign: Campaign, companies: Company[], context: AgentContext): Promise<LeadAssignment[]>
}

export interface CampaignHealth {
  status: 'healthy' | 'attention' | 'critical'
  risks: string[]
  recommendations: string[]
}

export interface AccountManagerAgent {
  assess(campaign: Campaign, context: AgentContext): Promise<CampaignHealth>
}
