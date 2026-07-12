# Границы гибридного MVP

## Реализовано в pilot-каркасе

- Next.js/TypeScript приложение и PostgreSQL schema/migration.
- Организации, membership roles и `organizationId` в бизнес-сущностях.
- Campaign и Account Readiness Score.
- Channel Policy Engine и suppression/consent модель.
- Routing для manual call, email draft, WhatsApp draft, research и review.
- Версионированная task card и snapshot для QA.
- Qualification evidence и next-best-action.
- CSV intake в интерфейсе и CRM-ready CSV export.
- OpenAI server adapter со Structured Outputs для evidence-bound research.
- PostgreSQL job queue, отдельный worker, audit events и AI usage schema.
- Tenant-scoped persistence API для campaign state и идемпотентного CSV import.
- Managed invite authentication и HttpOnly tenant sessions.
- SSRF-safe public research fetcher и provenance.
- Worker handlers для research, drafts, QA и retention cleanup.
- Persistent tasks, outcomes, suppression и next-best-action.
- Tenant object storage с SHA-256 и retention.
- Event-derived analytics и PostgreSQL CRM writeback.
- Docker Compose с приложением, worker, PostgreSQL и object-storage volume.
- Внутренний risk register, ADR и PR risk assessment.

## Ограничения пилота

- Managed authentication использует provisioned одноразовые invites; публичная регистрация отсутствует.
- Demo UI загружает и сохраняет состояние в PostgreSQL; при недоступной базе явно переключается на fixture fallback.
- Email и WhatsApp только draft-only.
- Телефония и реальные CRM API отсутствуют.
- Public research разрешает только HTTP(S) и блокирует private/local DNS targets.
- Автоматическая отправка, marketplace, billing и внешний контактный enrichment отсутствуют.
