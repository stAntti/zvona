import { sql } from './db'
import type { TransactionSql } from 'postgres'
import { demoAccounts, demoCampaign } from './fixtures'
import type { Account, Campaign, ContactPoint } from './domain'

const DEMO_ORG_SLUG = 'northstar-gifts-kz'

type IdRow = { id: string }

export interface PilotState {
  organizationId: string
  campaign: Campaign
  accounts: Account[]
}

export async function ensureDemoPilot(): Promise<{ organizationId: string; campaignId: string }> {
  const db = sql()
  return db.begin(async (tx) => {
    const existingOrganizations = await tx<IdRow[]>`select id from organizations where slug = ${DEMO_ORG_SLUG} limit 1`
    let organizationId = existingOrganizations[0]?.id
    if (!organizationId) {
      const inserted = await tx<IdRow[]>`insert into organizations (name, slug) values ('Northstar Gifts KZ', ${DEMO_ORG_SLUG}) returning id`
      organizationId = inserted[0].id
    }

    const existingCampaigns = await tx<IdRow[]>`select id from campaigns where organization_id = ${organizationId} order by created_at limit 1`
    let campaignId = existingCampaigns[0]?.id
    if (!campaignId) {
      const configuration = { ...demoCampaign, id: undefined, organizationId: undefined }
      const inserted = await tx<IdRow[]>`
        insert into campaigns (organization_id, name, offer, icp, configuration, readiness_score)
        values (${organizationId}, ${demoCampaign.name}, ${demoCampaign.offer}, ${demoCampaign.icp}, ${tx.json(configuration)}, 100)
        returning id
      `
      campaignId = inserted[0].id
      for (const account of demoAccounts) {
        await insertAccount(tx, organizationId, campaignId, account)
      }
    }
    return { organizationId, campaignId }
  })
}

async function insertAccount(db: TransactionSql, organizationId: string, campaignId: string, account: Account) {
  const profile = { ...account, id: undefined, organizationId: undefined, contacts: undefined }
  const rows = await db<IdRow[]>`
    insert into accounts (organization_id, campaign_id, external_id, name, domain, profile, readiness_score, suppressed)
    values (${organizationId}, ${campaignId}, ${account.externalId}, ${account.name}, ${account.domain || null}, ${db.json(profile)}, 0, false)
    on conflict (organization_id, campaign_id, external_id) do update set
      name = excluded.name, domain = excluded.domain, profile = excluded.profile
    returning id
  `
  const accountId = rows[0].id
  await db`delete from contact_points where organization_id = ${organizationId} and account_id = ${accountId}`
  for (const contact of account.contacts) {
    await db`
      insert into contact_points (organization_id, account_id, type, value, source_type, source_label, confidence, consent_status, suppressed, discovered_at)
      values (${organizationId}, ${accountId}, ${contact.type}, ${contact.value}, ${contact.sourceType}, ${contact.sourceLabel}, ${contact.confidence}, ${contact.consent}, ${contact.suppressed}, ${contact.discoveredAt})
    `
  }
}

export async function loadPilotState(organizationId: string): Promise<PilotState> {
  const db = sql()
  const campaigns = await db<Array<{ id: string; name: string; offer: string; icp: string; configuration: Omit<Campaign, 'id' | 'organizationId'> }>>`
    select id, name, offer, icp, configuration from campaigns
    where organization_id = ${organizationId} order by created_at limit 1
  `
  if (!campaigns[0]) throw new Error('Campaign not found')
  const row = campaigns[0]
  const campaign: Campaign = { ...row.configuration, id: row.id, organizationId, name: row.name, offer: row.offer, icp: row.icp }
  const accountRows = await db<Array<{ id: string; external_id: string; name: string; domain: string | null; profile: Omit<Account, 'id' | 'organizationId' | 'externalId' | 'name' | 'domain' | 'contacts'> }>>`
    select id, external_id, name, domain, profile from accounts
    where organization_id = ${organizationId} and campaign_id = ${row.id} order by created_at
  `
  const contactRows = await db<Array<{ id: string; account_id: string; type: 'email' | 'phone'; value: string; source_type: ContactPoint['sourceType']; source_label: string; discovered_at: Date; confidence: number; consent_status: ContactPoint['consent']; suppressed: boolean }>>`
    select id, account_id, type, value, source_type, source_label, discovered_at, confidence, consent_status, suppressed
    from contact_points where organization_id = ${organizationId}
  `
  const accounts = accountRows.map((account): Account => ({
    ...account.profile,
    id: account.id,
    organizationId,
    externalId: account.external_id,
    name: account.name,
    domain: account.domain ?? '',
    contacts: contactRows.filter((contact) => contact.account_id === account.id).map((contact) => ({
      id: contact.id, type: contact.type, value: contact.value, sourceType: contact.source_type, sourceLabel: contact.source_label,
      discoveredAt: contact.discovered_at.toISOString().slice(0, 10), confidence: contact.confidence, consent: contact.consent_status, suppressed: contact.suppressed,
    })),
  }))
  return { organizationId, campaign, accounts }
}

export async function saveCampaign(organizationId: string, campaign: Campaign): Promise<Campaign> {
  const db = sql()
  const configuration = { ...campaign, id: undefined, organizationId: undefined }
  const rows = await db<Array<{ id: string }>>`
    update campaigns set name = ${campaign.name}, offer = ${campaign.offer}, icp = ${campaign.icp},
      configuration = ${db.json(configuration)}, version = version + 1, updated_at = now()
    where id = ${campaign.id} and organization_id = ${organizationId} returning id
  `
  if (!rows[0]) throw new Error('Campaign not found in organization')
  await db`insert into audit_events (organization_id, action, entity_type, entity_id, metadata) values (${organizationId}, 'campaign.updated', 'campaign', ${campaign.id}, ${db.json({ name: campaign.name })})`
  return campaign
}

export async function upsertAccounts(organizationId: string, campaignId: string, accounts: Account[]) {
  const db = sql()
  const allowed = await db<IdRow[]>`select id from campaigns where id = ${campaignId} and organization_id = ${organizationId}`
  if (!allowed[0]) throw new Error('Campaign not found in organization')
  await db.begin(async (tx) => {
    for (const account of accounts) await insertAccount(tx, organizationId, campaignId, account)
    await tx`insert into audit_events (organization_id, action, entity_type, entity_id, metadata) values (${organizationId}, 'accounts.imported', 'campaign', ${campaignId}, ${tx.json({ count: accounts.length })})`
  })
  return { imported: accounts.length }
}
