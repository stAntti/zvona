import { describe, expect, it } from 'vitest'
import { calculateAccountReadiness, calculateCampaignReadiness, channelPolicy, isQualifiedSql, recommendNextAction, routeAccount, toCrmCsv } from './domain'
import { demoAccounts, demoCampaign } from './fixtures'

describe('readiness gates', () => {
  it('marks the configured campaign ready', () => {
    expect(calculateCampaignReadiness(demoCampaign)).toMatchObject({ score: 100, band: 'ready' })
  })

  it('blocks execution when campaign rules are incomplete', () => {
    const campaign = { ...demoCampaign, allowedClaims: [], qualificationDefinition: '' }
    expect(calculateCampaignReadiness(campaign).band).not.toBe('ready')
    expect(routeAccount(campaign, demoAccounts[0])).toMatchObject({ channel: 'manual_review', policy: 'blocked_by_campaign' })
  })

  it('sends incomplete accounts to research', () => {
    expect(calculateAccountReadiness(demoAccounts[2]).band).toBe('blocked')
    expect(routeAccount(demoCampaign, demoAccounts[2]).channel).toBe('manual_research')
  })
})

describe('channel policy and routing', () => {
  it('keeps email and WhatsApp draft-only', () => {
    expect(channelPolicy(true, 'email_draft', demoAccounts[0].contacts[1])).toBe('draft_only')
    expect(channelPolicy(true, 'whatsapp_draft', demoAccounts[0].contacts[0])).toBe('draft_only')
  })

  it('suppresses revoked contacts', () => {
    const contact = { ...demoAccounts[0].contacts[0], consent: 'revoked' as const }
    expect(channelPolicy(true, 'manual_call', contact)).toBe('suppressed')
  })

  it('routes high-potential accounts to a senior operator', () => {
    expect(routeAccount(demoCampaign, demoAccounts[0])).toMatchObject({ executor: 'senior_operator', channel: 'manual_call', ruleId: 'R-003' })
  })
})

describe('qualification and writeback', () => {
  it('requires all SQL evidence', () => {
    expect(isQualifiedSql({ decisionMaker: true, activeNeed: true, agreedNextStep: false })).toBe(false)
    expect(isQualifiedSql({ decisionMaker: true, activeNeed: true, agreedNextStep: true })).toBe(true)
  })

  it('routes qualified SQL to AE and opt-out to suppression', () => {
    expect(recommendNextAction('qualified', { decisionMaker: true, activeNeed: true, agreedNextStep: true })).toBe('route_to_ae')
    expect(recommendNextAction('opt_out', { decisionMaker: false, activeNeed: false, agreedNextStep: false })).toBe('suppress')
  })

  it('exports a CRM-safe CSV', () => {
    const account = demoAccounts[0]
    const csv = toCrmCsv([{ account, route: routeAccount(demoCampaign, account), outcome: 'qualified', nextAction: 'route_to_ae' }])
    expect(csv).toContain('external_account_id')
    expect(csv).toContain('KZ-1042')
    expect(csv).toContain('route_to_ae')
  })
})
