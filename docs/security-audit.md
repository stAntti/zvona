# Security audit гибридного пилота

Дата проверки: 2026-07-12.

| Контроль | Evidence |
|---|---|
| Tenant isolation | unauthenticated API 401; session-derived organization scope |
| Одноразовые invites | token hash, expiry, row lock; replay 401 |
| Session | 256-bit token, DB hash, HttpOnly, SameSite Strict, expiry |
| SSRF | protocol/DNS/private IP/redirect/timeout/MIME/size checks |
| Uploads | tenant paths, MIME/size allowlist, SHA-256 |
| Retention | 14/30/90 дней и worker cleanup E2E |
| Messaging | draft-only согласно ADR-001 |
| Suppression | opt-out suppresses account и contacts |
| AI provenance | URL, retrievedAt, model, prompt version и output |
| Secrets | `.env.local` исключён из Git и Docker context |

Перед публичным production остаются внешний penetration test, legal review по юрисдикциям, TLS, backup/restore drill и release dependency review.
