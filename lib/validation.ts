import { z } from 'zod'

export const channelSchema = z.enum(['manual_call', 'email_draft', 'whatsapp_draft', 'manual_research', 'manual_review'])
export const executorSchema = z.enum(['ai_nurture', 'junior_operator', 'senior_operator', 'account_executive', 'researcher'])

export const campaignSchema = z.object({
  id: z.string().min(1), organizationId: z.string().min(1), name: z.string().min(3).max(160), offer: z.string().min(20).max(4000), icp: z.string().min(20).max(4000),
  personas: z.array(z.string().min(2).max(160)).min(1), qualificationDefinition: z.string().min(15).max(2000),
  allowedClaims: z.array(z.string().min(2).max(500)).min(1), forbiddenClaims: z.array(z.string().min(2).max(500)).min(1),
  objections: z.array(z.string().min(2).max(500)).min(2), mandatoryLogging: z.array(z.string().min(2).max(100)).min(3),
  enabledChannels: z.array(channelSchema).min(1), assignedExecutors: z.array(executorSchema).min(1), budget: z.number().nonnegative(),
})

export const contactSchema = z.object({
  id: z.string().min(1), type: z.enum(['email', 'phone']), value: z.string().min(3).max(320), sourceType: z.enum(['csv', 'company_website', 'public_contact_page', 'manual']),
  sourceLabel: z.string().min(2).max(500), discoveredAt: z.string().date(), confidence: z.number().min(0).max(1), consent: z.enum(['unknown', 'granted', 'revoked']), suppressed: z.boolean(),
})

export const accountSchema = z.object({
  id: z.string().min(1), organizationId: z.string().min(1), externalId: z.string().min(1).max(200), name: z.string().min(2).max(300), domain: z.string().max(300), industry: z.string().max(200),
  employeeCount: z.number().int().positive().optional(), region: z.string().max(200), language: z.string().min(2).max(12), icpFit: z.boolean(), triggers: z.array(z.string().max(500)),
  persona: z.string().max(300), personaConfidence: z.number().min(0).max(1), potential: z.number().nonnegative(), contacts: z.array(contactSchema),
})

export const accountImportSchema = z.object({ campaignId: z.string().uuid(), accounts: z.array(accountSchema).min(1).max(5000) })
