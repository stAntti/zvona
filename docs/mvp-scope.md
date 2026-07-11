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
- Docker Compose с приложением, worker, PostgreSQL и object-storage volume.
- Внутренний risk register, ADR и PR risk assessment.

## Ограничения пилота

- Managed authentication представлена схемой пользователей и ролей; production identity provider и session enforcement подключаются перед внешним доступом.
- Demo UI работает на выдуманных данных; persistence API поверх PostgreSQL является следующим implementation slice.
- Email и WhatsApp только draft-only.
- Телефония и реальные CRM API отсутствуют.
- Research API принимает подготовленный текст источника; защищённый site fetcher не включён до отдельного security review.
- Автоматическая отправка, marketplace, billing и внешний контактный enrichment отсутствуют.
