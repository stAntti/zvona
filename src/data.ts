import type { Campaign, Company, EnrichmentProfile, Operator, QualityItem, TranscriptLine } from './domain'

export const campaign: Campaign = {
  id: 'new-year-kz-2026',
  name: 'Корпоративные подарки · Казахстан',
  goal: 'Найти компании с потребностью в 100+ корпоративных подарках',
  period: '15 сентября — 15 ноября 2026',
  baseCallRate: 1000,
  outcomeBonuses: { interested: 500, proposal: 400, callback: 200, supplier_selected: 0, other_contact: 100, not_relevant: 0, wrong_contact: 0, no_answer: 0 },
}

export const companies: Company[] = [
  { id: 'astra', name: 'Astra Logistics', industry: 'Логистика', city: 'Алматы', employees: 320, priority: 'high', priorityReason: 'Покупали подарки для 300+ сотрудников', status: 'queued', contact: { name: 'Алия Садыкова', position: 'Руководитель отдела персонала', phone: '+7 700 000 01 24' }, potential: '280–350 наборов', budget: '25–35 тыс. ₸ за набор', need: 'Подарки сотрудникам и ключевым партнёрам', risk: 'Есть постоянный поставщик', lastTouch: 'Новый контакт' },
  { id: 'qazbuild', name: 'QazBuild Group', industry: 'Строительство', city: 'Астана', employees: 540, priority: 'high', priorityReason: 'Высокий потенциал и сезонный спрос', status: 'queued', contact: { name: 'Марат Ержанов', position: 'Директор по закупкам', phone: '+7 700 000 02 18' }, potential: '450–550 наборов', budget: '18–28 тыс. ₸ за набор', need: 'Единый подарок для региональных офисов', risk: 'Сложная логистика', lastTouch: 'Открывали презентацию' },
  { id: 'nomad', name: 'Nomad Finance', industry: 'Финансы', city: 'Алматы', employees: 180, priority: 'medium', priorityReason: 'Подходит по ICP', status: 'queued', contact: { name: 'Жанна Абдрахманова', position: 'Office manager', phone: '+7 700 000 03 41' }, potential: '150–190 наборов', budget: '30–40 тыс. ₸ за набор', need: 'Премиальные наборы для команды', risk: 'Высокие требования к брендингу', lastTouch: 'Нет ответа 2 дня назад' },
  { id: 'steppe', name: 'Steppe Energy', industry: 'Энергетика', city: 'Атырау', employees: 760, priority: 'high', priorityReason: 'Крупный штат, раннее планирование', status: 'queued', contact: { name: 'Динара Иманова', position: 'HR business partner', phone: '+7 700 000 04 53' }, potential: '600–700 наборов', budget: '20–30 тыс. ₸ за набор', need: 'Подарки для сотрудников в регионах', risk: 'Требуется тендер', lastTouch: 'Рекомендация партнёра' },
  { id: 'orbit', name: 'Orbit Telecom', industry: 'Телеком', city: 'Астана', employees: 410, priority: 'medium', priorityReason: 'Релевантный размер компании', status: 'queued', contact: { name: 'Тимур Алимов', position: 'Менеджер по культуре', phone: '+7 700 000 05 67' }, potential: '350–420 наборов', budget: '22–32 тыс. ₸ за набор', need: 'Подарки удалённым сотрудникам', risk: 'Сжатые сроки согласования', lastTouch: 'Новый контакт' },
  { id: 'aral', name: 'Aral Foods', industry: 'FMCG', city: 'Шымкент', employees: 260, priority: 'medium', priorityReason: 'Совпадение по отрасли', status: 'queued', contact: { name: 'Сауле Ким', position: 'HR manager', phone: '+7 700 000 06 72' }, potential: '220–270 наборов', budget: '15–25 тыс. ₸ за набор', need: 'Массовые подарки сотрудникам', risk: 'Чувствительность к цене', lastTouch: 'Новый контакт' },
  { id: 'vertex', name: 'Vertex Systems', industry: 'IT', city: 'Алматы', employees: 95, priority: 'low', priorityReason: 'Небольшой объём, высокая маржа', status: 'queued', contact: { name: 'Роман Ли', position: 'People partner', phone: '+7 700 000 07 83' }, potential: '80–100 наборов', budget: '35–50 тыс. ₸ за набор', need: 'Необычные персональные подарки', risk: 'Нужна кастомизация', lastTouch: 'Новый контакт' },
  { id: 'altai', name: 'Altai Distribution', industry: 'Дистрибуция', city: 'Караганда', employees: 230, priority: 'low', priorityReason: 'Запас очереди', status: 'queued', contact: { name: 'Ерлан Турсынов', position: 'Административный директор', phone: '+7 700 000 08 94' }, potential: '200–240 наборов', budget: '18–24 тыс. ₸ за набор', need: 'Подарки партнёрам', risk: 'Нет утверждённого бюджета', lastTouch: 'Новый контакт' },
]

const defaultEnrichment = (company: Company, index: number): EnrichmentProfile => ({
  companyId: company.id,
  description: `${company.name} — выдуманная компания из отрасли «${company.industry}», работающая на рынке Казахстана.`,
  regions: company.city === 'Алматы' ? ['Алматы', 'Астана'] : [company.city],
  likelyDecisionMaker: company.contact.position,
  leadScore: Math.max(61, 94 - index * 4),
  potentialValue: index < 2 ? '8–14 млн ₸' : index < 5 ? '4–8 млн ₸' : '2–5 млн ₸',
  status: index < 4 ? 'READY' : index < 7 ? 'PARTIAL' : 'NEEDS_REVIEW',
  recommendedLevel: index === 3 ? 'Эксперт' : index < 5 ? 'Начальный' : 'Опытный',
  signals: [company.priorityReason, 'Штат компании подходит под целевой сегмент'],
  sources: [
    { id: `${company.id}-registry`, label: 'Demo Business Registry', kind: 'Профиль компании', confidence: 92 - index, checkedAt: '10 июля 2026' },
    { id: `${company.id}-careers`, label: 'Demo Careers Page', kind: 'Открытые вакансии', confidence: 78 - index, checkedAt: '8 июля 2026' },
  ],
  unknowns: ['Точный бюджет закупки', 'Утверждённый срок выбора поставщика'],
  confidence: Math.max(64, 89 - index * 3),
})

export const enrichmentProfiles: Record<string, EnrichmentProfile> = Object.fromEntries(companies.map((company, index) => [company.id, defaultEnrichment(company, index)]))

enrichmentProfiles.astra = {
  companyId: 'astra',
  description: 'Выдуманный логистический оператор для корпоративных клиентов с распределённой командой и собственным складским контуром.',
  regions: ['Алматы', 'Астана', 'Караганда', 'Шымкент'],
  likelyDecisionMaker: 'Руководитель отдела персонала совместно с директором по закупкам',
  leadScore: 94,
  potentialValue: '8,4–10,5 млн ₸',
  status: 'READY',
  recommendedLevel: 'Начальный',
  signals: ['Открыта вакансия менеджера по корпоративной культуре', 'Штат вырос примерно на 18% за год', 'В demo-календаре отмечено раннее планирование сезонных активностей'],
  sources: [
    { id: 'astra-registry', label: 'Demo Business Registry', kind: 'Профиль компании', confidence: 96, checkedAt: '10 июля 2026' },
    { id: 'astra-careers', label: 'Demo Careers Page', kind: 'Вакансии', confidence: 88, checkedAt: '9 июля 2026' },
    { id: 'astra-news', label: 'Demo Logistics Review', kind: 'Отраслевая публикация', confidence: 74, checkedAt: '6 июля 2026' },
  ],
  unknowns: ['Кто утверждает финальный бюджет', 'Сколько наборов потребуется партнёрам', 'Требования к доставке по регионам', 'Был ли утверждён бюджет на 2026 год'],
  confidence: 91,
}

export const transcript: TranscriptLine[] = [
  { speaker: 'operator', time: '00:04', stage: 'Приветствие', text: 'Алия, добрый день! Меня зовут Дана, компания ZVONA Gifts. Удобно две минуты?', sayNow: 'Уточните, удобно ли сейчас говорить.', nextQuestion: 'Вы отвечаете за корпоративные подарки сотрудникам?' },
  { speaker: 'client', time: '00:12', stage: 'Контакт', text: 'Добрый день. Да, могу пару минут. А по какому вопросу?', sayNow: 'Коротко обозначьте пользу: помогаем собрать и доставить подарки без перегрузки HR-команды.', nextQuestion: 'Вы отвечаете за корпоративные подарки сотрудникам?', completes: 'contact' },
  { speaker: 'operator', time: '00:26', stage: 'Потребность', text: 'Мы помогаем HR-командам собрать корпоративные наборы под бюджет и доставить их по Казахстану. Вы уже начали планировать подарки?', sayNow: 'Спросите, сколько получателей планируется в этом году.', nextQuestion: 'На какое количество сотрудников ориентируетесь?', completes: 'need' },
  { speaker: 'client', time: '00:38', stage: 'Возражение', text: 'Планировать начали, но у нас уже есть поставщик, с которым работали в прошлом году.', sayNow: 'Признайте опыт клиента и предложите сравнение без обязательств.', nextQuestion: 'Что для вас важнее при сравнении: состав, срок или бюджет?', objection: 'Уже есть поставщик', answer: 'Понимаю, менять проверенного партнёра без причины не хочется. Предлагаю подготовить один альтернативный вариант — сможете спокойно сравнить состав и сроки.', completes: 'objection' },
  { speaker: 'operator', time: '00:55', stage: 'Квалификация', text: 'Понимаю. Можем подготовить альтернативу без обязательств. На какое количество сотрудников ориентируетесь?', sayNow: 'Зафиксируйте объём и перейдите к бюджету.', nextQuestion: 'Какой бюджет комфортен на один набор?' },
  { speaker: 'client', time: '01:08', stage: 'Квалификация', text: 'Около трёхсот человек. В прошлом году было примерно тридцать тысяч тенге на человека.', sayNow: 'Подтвердите: около 300 наборов, ориентир 30 000 ₸.', nextQuestion: 'К какой дате подарки должны быть готовы?', completes: 'budget' },
  { speaker: 'operator', time: '01:23', stage: 'Срок', text: 'Зафиксировала: около 300 наборов и ориентир 30 000 тенге. К какой дате всё должно быть готово?', sayNow: 'Уточните требования к брендингу упаковки.', nextQuestion: 'Нужен ли логотип на коробке и открытке?', completes: 'deadline' },
  { speaker: 'client', time: '01:34', stage: 'Следующий шаг', text: 'До 10 декабря. Логотип нужен. Пришлите пару вариантов, я покажу директору.', sayNow: 'Согласуйте отправку двух вариантов сегодня до 17:00.', nextQuestion: 'Подойдёт, если менеджер пришлёт варианты сегодня до 17:00?', completes: 'nextStep' },
  { speaker: 'operator', time: '01:48', stage: 'Завершение', text: 'Отлично. Менеджер подготовит два варианта и пришлёт сегодня до 17:00. Спасибо, Алия!', sayNow: 'Поблагодарите и завершите разговор.', nextQuestion: 'Разговор можно завершить.', completes: 'close' },
]

export const qualityItems: QualityItem[] = [
  { label: 'Обязательные шаги', score: 96, weight: 25, note: 'Выполнено 5 из 5 ключевых шагов' },
  { label: 'Качество общения', score: 91, weight: 20, note: 'Спокойный темп и точные формулировки' },
  { label: 'Квалификация', score: 94, weight: 20, note: 'Объём, бюджет и срок зафиксированы' },
  { label: 'Работа с возражениями', score: 88, weight: 15, note: 'Возражение принято без давления' },
  { label: 'Корректность результата', score: 100, weight: 10, note: 'Результат подтверждается разговором' },
  { label: 'Соблюдение правил', score: 95, weight: 10, note: 'Правила кампании соблюдены' },
]

export const operators: Operator[] = [
  { id: 'dana', name: 'Дана Муратова', initials: 'ДМ', status: 'Онлайн', calls: 24, quality: 92, conversion: 29, earned: 28750 },
  { id: 'amir', name: 'Амир Нургалиев', initials: 'АН', status: 'Онлайн', calls: 28, quality: 87, conversion: 25, earned: 26400 },
  { id: 'vika', name: 'Виктория Цой', initials: 'ВЦ', status: 'Перерыв', calls: 19, quality: 90, conversion: 32, earned: 23800 },
  { id: 'ruslan', name: 'Руслан Омаров', initials: 'РО', status: 'Офлайн', calls: 16, quality: 79, conversion: 19, earned: 15200 },
]

export const trendData = [
  { day: 'Пн', calls: 62, quality: 82 }, { day: 'Вт', calls: 76, quality: 85 }, { day: 'Ср', calls: 71, quality: 84 },
  { day: 'Чт', calls: 88, quality: 89 }, { day: 'Пт', calls: 94, quality: 91 }, { day: 'Сб', calls: 54, quality: 90 },
]

export const funnelData = [
  { name: 'В очереди', value: 842, color: '#d9def3' },
  { name: 'Разговор', value: 438, color: '#8e9ce4' },
  { name: 'ЛПР', value: 286, color: '#586bc4' },
  { name: 'Интерес', value: 92, color: '#30469e' },
  { name: 'Передано', value: 68, color: '#17296f' },
]
