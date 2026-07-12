import { boolean, integer, jsonb, pgEnum, pgTable, real, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

export const jobStatus = pgEnum('job_status', ['queued', 'running', 'succeeded', 'failed'])
export const taskStatus = pgEnum('task_status', ['planned', 'ready', 'in_progress', 'completed', 'cancelled'])

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(), name: text('name').notNull(), slug: text('slug').notNull().unique(), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(), email: text('email').notNull().unique(), name: text('name').notNull(), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const memberships = pgTable('memberships', {
  id: uuid('id').primaryKey().defaultRandom(), organizationId: uuid('organization_id').notNull().references(() => organizations.id), userId: uuid('user_id').notNull().references(() => users.id), role: text('role').notNull(),
}, (table) => [uniqueIndex('membership_org_user').on(table.organizationId, table.userId)])

export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(), organizationId: uuid('organization_id').notNull().references(() => organizations.id), name: text('name').notNull(), offer: text('offer').notNull(), icp: text('icp').notNull(), configuration: jsonb('configuration').notNull(), readinessScore: integer('readiness_score').notNull().default(0), version: integer('version').notNull().default(1), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(), organizationId: uuid('organization_id').notNull().references(() => organizations.id), campaignId: uuid('campaign_id').notNull().references(() => campaigns.id), externalId: text('external_id'), name: text('name').notNull(), domain: text('domain'), profile: jsonb('profile').notNull(), readinessScore: integer('readiness_score').notNull().default(0), suppressed: boolean('suppressed').notNull().default(false), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex('account_org_campaign_external').on(table.organizationId, table.campaignId, table.externalId)])

export const contactPoints = pgTable('contact_points', {
  id: uuid('id').primaryKey().defaultRandom(), organizationId: uuid('organization_id').notNull().references(() => organizations.id), accountId: uuid('account_id').notNull().references(() => accounts.id), type: text('type').notNull(), value: text('value').notNull(), sourceType: text('source_type').notNull(), sourceLabel: text('source_label').notNull(), sourceUrl: text('source_url'), confidence: real('confidence').notNull(), consentStatus: text('consent_status').notNull().default('unknown'), suppressed: boolean('suppressed').notNull().default(false), discoveredAt: timestamp('discovered_at', { withTimezone: true }).notNull().defaultNow(),
})

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(), organizationId: uuid('organization_id').notNull().references(() => organizations.id), campaignId: uuid('campaign_id').notNull().references(() => campaigns.id), accountId: uuid('account_id').notNull().references(() => accounts.id), status: taskStatus('status').notNull().default('planned'), channel: text('channel').notNull(), executorType: text('executor_type').notNull(), routingRuleId: text('routing_rule_id').notNull(), cardSnapshot: jsonb('card_snapshot').notNull(), outcome: jsonb('outcome'), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(), completedAt: timestamp('completed_at', { withTimezone: true }),
})

export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(), organizationId: uuid('organization_id').notNull().references(() => organizations.id), type: text('type').notNull(), status: jobStatus('status').notNull().default('queued'), payload: jsonb('payload').notNull(), idempotencyKey: text('idempotency_key').notNull().unique(), attempts: integer('attempts').notNull().default(0), maxAttempts: integer('max_attempts').notNull().default(3), runAfter: timestamp('run_after', { withTimezone: true }).notNull().defaultNow(), lockedAt: timestamp('locked_at', { withTimezone: true }), lastError: text('last_error'), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const auditEvents = pgTable('audit_events', {
  id: uuid('id').primaryKey().defaultRandom(), organizationId: uuid('organization_id').notNull().references(() => organizations.id), actorId: uuid('actor_id'), action: text('action').notNull(), entityType: text('entity_type').notNull(), entityId: text('entity_id').notNull(), metadata: jsonb('metadata').notNull(), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const aiRuns = pgTable('ai_runs', {
  id: uuid('id').primaryKey().defaultRandom(), organizationId: uuid('organization_id').notNull().references(() => organizations.id), taskType: text('task_type').notNull(), model: text('model').notNull(), promptVersion: text('prompt_version').notNull(), sourceRefs: jsonb('source_refs').notNull(), structuredOutput: jsonb('structured_output'), inputTokens: integer('input_tokens'), outputTokens: integer('output_tokens'), costMicros: integer('cost_micros'), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const pilotInvites = pgTable('pilot_invites', { id: uuid('id').primaryKey().defaultRandom(), organizationId: uuid('organization_id').notNull().references(() => organizations.id), email: text('email').notNull(), role: text('role').notNull(), tokenHash: text('token_hash').notNull().unique(), expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(), usedAt: timestamp('used_at', { withTimezone: true }) })
export const pilotSessions = pgTable('pilot_sessions', { id: uuid('id').primaryKey().defaultRandom(), organizationId: uuid('organization_id').notNull().references(() => organizations.id), userId: uuid('user_id').notNull().references(() => users.id), tokenHash: text('token_hash').notNull().unique(), expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(), revokedAt: timestamp('revoked_at', { withTimezone: true }) })
