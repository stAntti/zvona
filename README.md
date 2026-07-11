# ZVONA

Гибридный MVP управляемого B2B outreach для design partners.

```text
ICP import → research → readiness → enrichment → routing
→ outreach task → QA → next-best-action → CSV writeback
```

## Локальный запуск

```bash
npm install
npm run dev
```

Откройте `http://localhost:3000`. Без PostgreSQL интерфейс работает на выдуманных demo-данных. API-ключ хранится только в `.env.local`, который исключён из Git.

## Production-like запуск

```bash
docker compose up -d --build
```

Compose поднимает Next.js, PostgreSQL, отдельный worker и локальный object-storage volume.

## Проверка

```bash
npm test
npm run build
```

## Границы пилота

- звонки выполняются вручную;
- email и WhatsApp создаются только как черновики;
- CRM writeback выполняется через CSV;
- публичный номер не считается согласием на WhatsApp;
- реальные CRM, телефония, billing и data providers не подключены.

Архитектура и правила описаны в `docs/`. Внутренний реестр рисков: [docs/risk-register.md](docs/risk-register.md).
