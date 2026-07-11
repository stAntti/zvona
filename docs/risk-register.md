# Внутренний реестр рисков ZVONA

Документ предназначен для founder, product и engineering-команды. Он не показывается design partners и пользователям кампаний.

## Правила ведения

- Review проводится каждые две недели во время пилота.
- Риски с impact `high` или `critical` проверяются перед каждым production release.
- Новый внешний канал, datasource или AI-автоматизация обновляет существующую запись либо создаёт новую.
- `mitigated` требует evidence. `accepted` требует владельца и даты следующего review.
- Связанные issues и ADR получают метку `risk:<id>`.

Допустимые значения:

- probability: `low`, `medium`, `high`;
- impact: `low`, `medium`, `high`, `critical`;
- status: `open`, `monitoring`, `mitigated`, `accepted`.

## Реестр

| ID | Риск и причина | P | Impact | Ранние индикаторы | Меры снижения | Владелец | Компоненты | Last review | Next review | Status | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| R-001 | Коммодитизация AI: voice и reasoning дешевеют, prompts копируются | high | high | Конкуренты повторяют copilot; цена inference падает | First-party outcome data, QA, routing, eval-наборы | Product | AI, QA, routing | 2026-07-12 | 2026-07-26 | monitoring | ADR-001 |
| R-002 | Человеческий фактор: оператор отклоняется от message discipline | high | high | QA-ошибки; запрещённые claims; пропущенные поля | Guarded autonomy, certification, task snapshot, mandatory logging, reputation score | Operations | task card, QA | 2026-07-12 | 2026-07-26 | open | Pilot QA report |
| R-003 | Regulatory drag: recording, privacy, messaging, KYC/KYB | medium | critical | Новые правила; жалобы; запросы на удаление | Jurisdiction profiles, consent/suppression ledger, manual review, external counsel | Founder | contacts, outreach, storage | 2026-07-12 | 2026-07-26 | open | Legal review required |
| R-004 | False expectations и churn: клиент покупает продажи при слабом offer | high | high | Низкий readiness; спор по outcomes; ранний churn | Readiness gate, refusal policy, success criteria | Product | campaign intake | 2026-07-12 | 2026-07-26 | monitoring | Readiness acceptance tests |
| R-005 | Marketplace fraud и падение качества | medium | critical | Подмена личности; аномальные outcomes; disputes | Curated supply first, screening, identity checks, audit, dispute engine | Operations | identity, QA | 2026-07-12 | 2026-07-26 | accepted | Marketplace out of MVP |
| R-006 | Data-provider lock-in и ограничения external use | high | high | Изменение terms; рост цены; отключение API | Provider adapters, отдельные agreements, provenance, outcome graph | Founder | research, enrichment | 2026-07-12 | 2026-07-26 | monitoring | External providers out of MVP |
| R-007 | AI hype mismatch: demo интереснее измеримого ROI | high | high | Demo usage без активных кампаний; нет accepted SQL | Продавать speed-to-qualified-outcome, coverage и cost per SQL | Product | analytics | 2026-07-12 | 2026-07-26 | open | Pilot metrics |
| R-008 | Channel/platform enforcement | high | critical | Opt-out; жалобы; блокировка домена или WhatsApp | Draft-only MVP, channel policy, consent, suppression, официальные API | Compliance | outreach | 2026-07-12 | 2026-07-26 | monitoring | ADR-001 |
| R-009 | Tenant/data leakage | medium | critical | Cross-tenant ответы или экспорт | organizationId scoping, authorization tests, audit, scoped storage | Engineering | API, database, storage | 2026-07-12 | 2026-07-26 | open | Security test suite |
| R-010 | AI hallucinated claims | high | critical | Draft содержит claim без evidence | Claims registry, evidence-bound generation, blocking validation, human approval | AI/QA | AI, task card | 2026-07-12 | 2026-07-26 | open | Structured-output tests |
| R-011 | Research provenance failure | medium | high | Факт нельзя подтвердить; источник устарел | URL, evidence, retrievedAt, confidence, revalidation | Research | research | 2026-07-12 | 2026-07-26 | open | Provenance schema |
| R-012 | Unit economics failure | medium | high | Research/QA cost выше outcome value | Usage metering, model routing, stage cost, retry limits | Founder | AI, analytics | 2026-07-12 | 2026-07-26 | open | ai_runs cost fields |

## Release gate

Перед релизом ответственный подтверждает:

1. Нет нового неучтённого datasource или канала.
2. Tenant isolation покрыт тестами.
3. AI не может отправить сообщение или изменить outcome без policy gate.
4. Suppression блокирует новые outreach-задачи.
5. High/critical риски имеют владельца и актуальную дату review.
