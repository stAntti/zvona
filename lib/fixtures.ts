import type { Account, Campaign } from './domain'

export const demoCampaign: Campaign = {
  id: 'campaign-gifts-kz', organizationId: 'org-zvona', name: 'Корпоративные подарки · KZ',
  offer: 'Подбираем и доставляем брендированные корпоративные подарки по Казахстану под бюджет и сроки клиента.',
  icp: 'Компании Казахстана со штатом от 100 сотрудников, закупающие подарки сотрудникам и партнёрам.',
  personas: ['HR Director', 'Head of Procurement', 'Office Manager'],
  qualificationDefinition: 'Найден ЛПР, подтверждена потребность и согласован следующий шаг.',
  allowedClaims: ['Доставка по Казахстану', 'Брендирование коробки и открытки', 'Подбор состава под утверждённый бюджет'],
  forbiddenClaims: ['Гарантировать минимальную цену', 'Обещать срок без проверки производства', 'Давать юридические гарантии'],
  objections: ['Уже есть поставщик', 'Нет бюджета', 'Пришлите информацию', 'Вернитесь позже'],
  mandatoryLogging: ['Outcome', 'Objections', 'Notes', 'Mood', 'Next-best-action'],
  enabledChannels: ['manual_call', 'email_draft', 'whatsapp_draft'],
  assignedExecutors: ['junior_operator', 'senior_operator', 'ai_nurture'], budget: 4_800_000,
}

export const demoAccounts: Account[] = [
  {
    id: 'astra', organizationId: 'org-zvona', externalId: 'KZ-1042', name: 'Astra Logistics', domain: 'astra-logistics.example', industry: 'Логистика', employeeCount: 340,
    region: 'Алматы', language: 'ru', icpFit: true, triggers: ['Штат вырос на 18%', 'HR публикует программу признания сотрудников'], persona: 'HR Director', personaConfidence: .91, potential: 8_200_000,
    contacts: [
      { id: 'astra-phone', type: 'phone', value: '+7 700 000 00 01', sourceType: 'company_website', sourceLabel: 'Страница контактов компании', discoveredAt: '2026-07-10', confidence: .94, consent: 'unknown', suppressed: false },
      { id: 'astra-email', type: 'email', value: 'hr@astra-logistics.example', sourceType: 'company_website', sourceLabel: 'Страница вакансий', discoveredAt: '2026-07-10', confidence: .86, consent: 'unknown', suppressed: false },
    ],
  },
  {
    id: 'qazbuild', organizationId: 'org-zvona', externalId: 'KZ-1188', name: 'QazBuild Group', domain: 'qazbuild.example', industry: 'Строительство', employeeCount: 210,
    region: 'Астана', language: 'ru', icpFit: true, triggers: ['Открыты 27 новых вакансий'], persona: 'Head of Procurement', personaConfidence: .76, potential: 3_400_000,
    contacts: [{ id: 'qaz-email', type: 'email', value: 'office@qazbuild.example', sourceType: 'csv', sourceLabel: 'ICP import 12.07.2026', discoveredAt: '2026-07-12', confidence: .78, consent: 'unknown', suppressed: false }],
  },
  {
    id: 'nomad', organizationId: 'org-zvona', externalId: 'KZ-1201', name: 'Nomad Foods', domain: 'nomad-foods.example', industry: 'FMCG', employeeCount: 72,
    region: 'Шымкент', language: 'kk', icpFit: false, triggers: [], persona: 'Office Manager', personaConfidence: .42, potential: 680_000, contacts: [],
  },
]
