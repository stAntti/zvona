import type { Account, Campaign } from './domain'

export const demoCampaign: Campaign = {
  id: 'campaign-online-cashbox-kz', organizationId: 'org-zvona', name: 'Онлайн-кассы · KZ',
  offer: 'Помогаем подключить онлайн-кассу под ключ: подобрать решение, оформить и запустить кассу для бизнеса.',
  icp: 'Розничные точки, кафе, салоны и сервисные компании Казахстана, которым нужна онлайн-касса или выгоднее условия текущего решения.',
  personas: ['Владелец бизнеса', 'Управляющий точкой', 'Финансовый менеджер'],
  qualificationDefinition: 'Найден ЛПР, подтверждена потребность и согласован следующий шаг.',
  allowedClaims: ['Подбор решения под формат точки', 'Расчёт условий до подключения', 'Помощь с запуском онлайн-кассы'],
  forbiddenClaims: ['Обещать конкретную комиссию без расчёта', 'Гарантировать регистрацию или запуск без проверки данных', 'Критиковать или сравнивать конкурента без фактов'],
  objections: ['Уже есть касса', 'Касса не нужна', 'Дорого', 'Перезвоните позже'],
  mandatoryLogging: ['Outcome', 'Текущее решение', 'Возражения', 'Notes', 'Next-best-action'],
  enabledChannels: ['manual_call', 'email_draft', 'whatsapp_draft'],
  assignedExecutors: ['junior_operator', 'senior_operator', 'ai_nurture'], budget: 4_800_000,
}

export const demoAccounts: Account[] = [
  {
    id: 'astra', organizationId: 'org-zvona', externalId: 'KZ-1042', name: 'Astra Logistics', domain: 'astra-logistics.example', industry: 'Логистика', employeeCount: 340,
    region: 'Алматы', language: 'ru', icpFit: true, triggers: ['Работает несколько точек приёма оплат', 'Розничный формат бизнеса'], persona: 'Владелец бизнеса', personaConfidence: .91, potential: 8_200_000,
    contacts: [
      { id: 'astra-phone', type: 'phone', value: '+7 700 000 00 01', sourceType: 'company_website', sourceLabel: 'Страница контактов компании', discoveredAt: '2026-07-10', confidence: .94, consent: 'unknown', suppressed: false },
      { id: 'astra-email', type: 'email', value: 'hr@astra-logistics.example', sourceType: 'company_website', sourceLabel: 'Страница вакансий', discoveredAt: '2026-07-10', confidence: .86, consent: 'unknown', suppressed: false },
    ],
    bin: '240140000001', oked: '49410', employeeRange: '251–500 сотрудников', city: 'Алматы', address: 'проспект Абая, 101', leaderName: 'Алия Садыкова', registrationDate: '2024-01-16',
    aiSummary: 'Компания принимает оплату от клиентов и подходит для проверки текущего кассового решения. На звонке важно выяснить, есть ли касса, какой сервис используют сейчас и что в нём неудобно.',
    unknowns: ['Есть ли действующая онлайн-касса', 'Текущий поставщик и условия', 'Кто принимает решение по кассе'],
  },
  {
    id: 'qazbuild', organizationId: 'org-zvona', externalId: 'KZ-1188', name: 'QazBuild Group', domain: 'qazbuild.example', industry: 'Строительство', employeeCount: 210,
    region: 'Астана', language: 'ru', icpFit: true, triggers: ['Открыта новая торговая точка', 'Принимает оплату от физических лиц'], persona: 'Управляющий точкой', personaConfidence: .76, potential: 3_400_000,
    contacts: [{ id: 'qaz-email', type: 'email', value: 'office@qazbuild.example', sourceType: 'csv', sourceLabel: 'ICP import 12.07.2026', discoveredAt: '2026-07-12', confidence: .78, consent: 'unknown', suppressed: false }],
    bin: '210240000002', oked: '41201', employeeRange: '151–250 сотрудников', city: 'Астана', address: 'улица Достык, 12', leaderName: 'Марат Ибраев', registrationDate: '2021-02-18',
    aiSummary: 'У компании есть сигнал новой точки, поэтому онлайн-касса может быть нужна до запуска продаж. На звонке нужно найти ответственного и уточнить срок открытия.',
    unknowns: ['Дата открытия точки', 'Нужна ли онлайн-касса', 'Контакт владельца или управляющего'],
  },
  {
    id: 'nomad', organizationId: 'org-zvona', externalId: 'KZ-1201', name: 'Nomad Foods', domain: 'nomad-foods.example', industry: 'FMCG', employeeCount: 72,
    region: 'Шымкент', language: 'kk', icpFit: false, triggers: [], persona: 'Office Manager', personaConfidence: .42, potential: 680_000, contacts: [],
    bin: '190340000003', oked: '10890', employeeRange: '51–100 сотрудников', city: 'Шымкент', leaderName: 'Демо-руководитель', registrationDate: '2019-03-14',
    aiSummary: 'Небольшая компания без подтверждённого розничного формата. Не ставьте её в очередь, пока не появится сигнал о приёме оплат от клиентов.',
    unknowns: ['Рабочий контакт', 'Нужна ли онлайн-касса'],
  },
]
