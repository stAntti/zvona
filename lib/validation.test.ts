import { describe, expect, it } from 'vitest'
import { accountImportSchema, campaignSchema } from './validation'
import { demoAccounts, demoCampaign } from './fixtures'

describe('persistence API validation', () => {
  it('accepts the complete campaign contract', () => {
    expect(campaignSchema.parse(demoCampaign).name).toBe(demoCampaign.name)
  })

  it('rejects a campaign without evidence-bound claims', () => {
    expect(() => campaignSchema.parse({ ...demoCampaign, allowedClaims: [] })).toThrow()
  })

  it('limits a single account import batch', () => {
    const accounts = Array.from({ length: 5001 }, (_, index) => ({ ...demoAccounts[0], id: `account-${index}`, externalId: `EXT-${index}` }))
    expect(() => accountImportSchema.parse({ campaignId: '9728b3af-3df3-44c9-bc2d-e72173f66f2d', accounts })).toThrow()
  })

  it('requires a UUID campaign id for imports', () => {
    expect(() => accountImportSchema.parse({ campaignId: 'campaign-demo', accounts: [demoAccounts[0]] })).toThrow()
  })
})
