import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, NavLink, Navigate, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, BarChart3, Bell, BookOpenCheck, Bot, BriefcaseBusiness,
  Building2, CalendarClock, Check, CheckCircle2, ChevronRight, CircleDollarSign, ClipboardCheck,
  Clock3, Coffee, FileCheck2, Gift, Headphones, LayoutDashboard, ListFilter, MessageSquareQuote,
  MoreHorizontal, Pause, Phone, Play, RotateCcw, Search, ShieldCheck, Sparkles, Square, Star,
  Database, Globe2, GraduationCap, LockKeyhole, Target, Trophy, TrendingUp, UserRound, UsersRound, WalletCards, WandSparkles, XCircle, Zap,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { campaign, companies, enrichmentProfiles, operators, qualityItems, transcript, trendData } from './data'
import { calculatePayout, calculateQualityScore, formatMoney, payoutCoefficient, type CallResult, type CallValidity, type OutcomeType, type Role } from './domain'
import { useAppStore } from './store'

const roleLabels: Record<Role, string> = {
  operator: 'Оператор',
  campaign_manager: 'Руководитель кампании',
  quality_controller: 'Контролёр качества',
  sales_manager: 'Менеджер по продажам',
}

const navByRole: Record<Role, { label: string; to: string; icon: typeof LayoutDashboard }[]> = {
  operator: [
    { label: 'Обучение', to: '/onboarding', icon: GraduationCap },
    { label: 'Обзор кампании', to: '/campaign', icon: LayoutDashboard },
    { label: 'Очередь компаний', to: '/queue', icon: ListFilter },
    { label: 'Мой кабинет', to: '/operator', icon: UserRound },
    { label: 'Начисления', to: '/payouts', icon: WalletCards },
  ],
  campaign_manager: [
    { label: 'Обзор кампании', to: '/campaign', icon: LayoutDashboard },
    { label: 'Аналитика', to: '/analytics', icon: BarChart3 },
    { label: 'Операторы', to: '/operators', icon: UsersRound },
  ],
  quality_controller: [
    { label: 'Контроль качества', to: '/quality', icon: ShieldCheck },
    { label: 'Обзор кампании', to: '/campaign', icon: LayoutDashboard },
  ],
  sales_manager: [
    { label: 'Переданные лиды', to: '/handoffs', icon: BriefcaseBusiness },
    { label: 'Обзор кампании', to: '/campaign', icon: LayoutDashboard },
  ],
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/welcome" replace />} />
      <Route path="/welcome" element={<WelcomeScreen />} />
      <Route element={<AppShell />}>
        <Route path="/onboarding" element={<OperatorOnboarding />} />
        <Route path="/campaign" element={<CampaignOverview />} />
        <Route path="/queue" element={<CompanyQueue />} />
        <Route path="/companies/:companyId" element={<CompanyPage />} />
        <Route path="/calls/:companyId/preparation" element={<CallPreparation />} />
        <Route path="/calls/:callId/complete" element={<CallCompletion />} />
        <Route path="/calls/:callId/quality" element={<QualityReview />} />
        <Route path="/operator" element={<OperatorCabinet />} />
        <Route path="/payouts" element={<Payouts />} />
        <Route path="/quality" element={<QualityPlaceholder />} />
        <Route path="/operators" element={<Placeholder kind="operators" />} />
        <Route path="/analytics" element={<Placeholder kind="analytics" />} />
        <Route path="/handoffs" element={<Placeholder kind="handoffs" />} />
      </Route>
      <Route path="/calls/:callId/live" element={<LiveCall />} />
      <Route path="*" element={<Navigate to="/campaign" replace />} />
    </Routes>
  )
}

function WelcomeScreen() {
  const completed = useAppStore((state) => state.onboardingCompleted)
  const isReturning = completed.length === onboardingLessons.length
  const trainingPercent = Math.round((completed.length / onboardingLessons.length) * 100)
  const nextCompany = companies[0]
  const nextStep = isReturning ? '/queue' : '/onboarding'
  return <div className="welcome-screen">
    <header className="welcome-header">
      <Link className="brand" to="/welcome"><span className="brand-mark">Z</span><span>ZVONA<small>operator workspace</small></span></Link>
      <nav className="welcome-nav" aria-label="Быстрая навигация">
        <Link to="/onboarding">Обучение</Link>
        <Link to="/queue">Очередь</Link>
        <Link to="/operator">Кабинет</Link>
      </nav>
      <span className="welcome-demo"><ShieldCheck size={14}/> Demo без реальных звонков</span>
    </header>
    <main className="welcome-main">
      <section className="welcome-brief">
        <span className="mission-label"><Zap size={15}/> Смена готова</span>
        <h1>{isReturning ? 'Дана, можно продолжать очередь' : 'Дана, начните с короткого обучения'}</h1>
        <p className="welcome-lead">Сегодня фокус на компаниях Казахстана, которым нужны корпоративные подарки. ZVONA показывает контекст, подсказки в звонке и честный расчёт оплаты за качество.</p>
        <div className="welcome-actions">
          <Link className="welcome-start" to={nextStep}>{isReturning ? 'Открыть очередь' : 'Продолжить обучение'} <ArrowRight size={18}/></Link>
          <Link className="welcome-secondary" to="/campaign">Обзор кампании</Link>
        </div>
      </section>

      <section className="operator-console" aria-label="Рабочая панель оператора">
        <div className="console-head">
          <div>
            <span>Рабочее место</span>
            <h2>Смена оператора</h2>
          </div>
          <span className="status-pill live"><span/> Онлайн</span>
        </div>
        <div className="console-grid">
          <article className="console-primary">
            <div className="operator-id"><span className="avatar">ДМ</span><div><strong>Дана Муратова</strong><small>Оператор · начальный уровень</small></div></div>
            <div className="next-action">
              <span>Следующий шаг</span>
              <strong>{isReturning ? 'Позвонить подготовленной компании' : 'Закончить обучение перед первым звонком'}</strong>
              <Link to={nextStep}>{isReturning ? 'Перейти к очереди' : 'Открыть урок'} <ChevronRight size={16}/></Link>
            </div>
          </article>
          <article className="console-metric">
            <GraduationCap size={18}/>
            <span>Обучение</span>
            <strong>{completed.length} из {onboardingLessons.length}</strong>
            <div className="console-progress"><i style={{ width: `${trainingPercent}%` }} /></div>
          </article>
          <article className="console-metric">
            <Target size={18}/>
            <span>Цель смены</span>
            <strong>0 / 8</strong>
            <small>качественных разговоров</small>
          </article>
          <article className="console-metric">
            <CircleDollarSign size={18}/>
            <span>Потенциал</span>
            <strong>до 14 000 ₸</strong>
            <small>при высоком качестве</small>
          </article>
        </div>
        <div className="next-call">
          <div className="company-logo">{nextCompany.name.split(' ').map((word) => word[0]).join('').slice(0, 2)}</div>
          <div>
            <span>Ближайший подготовленный звонок</span>
            <strong>{nextCompany.name}</strong>
            <small>{nextCompany.contact.position} · {nextCompany.city} · {nextCompany.potential}</small>
          </div>
          <Link className="button secondary" to={`/companies/${nextCompany.id}`}>Досье <ArrowRight size={15}/></Link>
        </div>
        <div className="system-strip">
          <span><Headphones size={15}/> Микрофон готов</span>
          <span><Bot size={15}/> AI-копилот активен</span>
          <span><Database size={15}/> Только demo-данные</span>
        </div>
      </section>
    </main>
    <footer className="welcome-footer">ZVONA · Учебный прототип · Все компании, контакты и разговоры выдуманы</footer>
  </div>
}

function AppShell() {
  const role = useAppStore((state) => state.role)
  const setRole = useAppStore((state) => state.setRole)
  const resetDemo = useAppStore((state) => state.resetDemo)
  const navigate = useNavigate()
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/welcome"><span className="brand-mark">Z</span><span>ZVONA<small>AI call workspace</small></span></Link>
        <div className="campaign-chip"><span className="campaign-dot" /><span><small>Активная кампания</small>Подарки · KZ 2026</span></div>
        <nav className="nav-list">
          <span className="nav-label">Рабочее пространство</span>
          {navByRole[role].map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <item.icon size={18} /><span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="reset-button" onClick={() => { resetDemo(); navigate('/campaign') }}><RotateCcw size={15} /> Сбросить демо</button>
          <div className="demo-note"><Sparkles size={15} /><span>Все данные выдуманы<br /><small>Локальный demo-режим</small></span></div>
        </div>
      </aside>
      <div className="shell-main">
        <header className="topbar">
          <div><p className="eyebrow">Кампания</p><strong>{campaign.name}</strong></div>
          <div className="topbar-actions">
            <label className="role-picker"><span>Demo-роль</span><select value={role} onChange={(event) => { const next = event.target.value as Role; setRole(next); navigate(navByRole[next][0].to) }}>{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <button className="icon-button" aria-label="Уведомления"><Bell size={18} /><span className="notification-dot" /></button>
            <div className="profile"><span className="avatar">ДМ</span><span><strong>Дана Муратова</strong><small>{roleLabels[role]}</small></span></div>
          </div>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  )
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-header"><div><p className="eyebrow accent">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{action && <div className="page-actions">{action}</div>}</div>
}

function StatCard({ label, value, detail, icon: Icon, tone = 'indigo' }: { label: string; value: string; detail: string; icon: typeof Activity; tone?: string }) {
  return <div className="card stat-card"><div className={`stat-icon ${tone}`}><Icon size={20} /></div><div><p>{label}</p><strong>{value}</strong><small>{detail}</small></div></div>
}

function CampaignOverview() {
  const completed = useAppStore((state) => state.completedDemo)
  const disputed = useAppStore((state) => state.disputed)
  return <>
    <PageHeader eyebrow="Обзор кампании" title="Доброе утро, Дана" description="Главное о кампании и следующий лучший шаг на сегодня." action={<Link className="button primary" to="/queue"><Phone size={17} /> Открыть очередь</Link>} />
    <section className="hero-card">
      <div><span className="status-pill live"><span /> Кампания активна</span><h2>Корпоративные подарки<br />для компаний Казахстана</h2><p>{campaign.goal}</p><div className="hero-meta"><span><CalendarClock size={16} /> {campaign.period}</span><span><Target size={16} /> Цель: 120 заинтересованных</span></div></div>
      <div className="progress-orbit"><div><strong>{completed ? '61' : '60'}%</strong><span>плана<br />выполнено</span></div></div>
    </section>
    <div className="stats-grid">
      <StatCard label="Звонки сегодня" value={completed ? '95' : '94'} detail="+12% к среднему" icon={Phone} />
      <StatCard label="Разговоры с ЛПР" value="65%" detail="61 из 94 звонков" icon={UserRound} tone="blue" />
      <StatCard label="Заинтересованы" value={completed ? '93' : '92'} detail="Цель кампании: 120" icon={TrendingUp} tone="green" />
      <StatCard label="Среднее качество" value={completed ? '91' : '88'} detail="+4 п.п. за неделю" icon={Star} tone="amber" />
    </div>
    <div className="dashboard-grid">
      <section className="card chart-card"><div className="section-title"><div><h3>Темп и качество</h3><p>Динамика за последние 6 дней</p></div><span className="legend"><i /> Звонки</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData}><defs><linearGradient id="callsGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5367c7" stopOpacity={0.35}/><stop offset="100%" stopColor="#5367c7" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ebf2"/><XAxis dataKey="day" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false}/><Tooltip/><Area type="monotone" dataKey="calls" stroke="#5367c7" strokeWidth={3} fill="url(#callsGradient)"/></AreaChart></ResponsiveContainer></div></section>
      <section className="card"><div className="section-title"><div><h3>Следующие действия</h3><p>Приоритеты на сегодня</p></div><MoreHorizontal size={20}/></div><div className="action-list"><ActionRow icon={Phone} title="Продолжить очередь" text="8 компаний с высоким приоритетом" to="/queue" /><ActionRow icon={ClipboardCheck} title={disputed ? 'Апелляция отправлена' : 'Проверить рекомендации'} text={disputed ? 'Контролёр качества получил заявку' : '2 новых совета от AI-копилота'} to="/operator" /><ActionRow icon={Clock3} title="Перезвон в 15:30" text="QazBuild Group · Марат Ержанов" to="/queue" /></div></section>
    </div>
  </>
}

function ActionRow({ icon: Icon, title, text, to }: { icon: typeof Phone; title: string; text: string; to: string }) {
  return <Link className="action-row" to={to}><span><Icon size={18}/></span><div><strong>{title}</strong><small>{text}</small></div><ChevronRight size={17}/></Link>
}

const onboardingLessons = [
  { id: 'product', icon: Gift, kicker: 'Продукт', title: 'Что продаёт ZVONA Gifts', text: 'Корпоративные новогодние подарки: готовые и индивидуальные наборы со сладостями, полезными товарами, упаковкой и брендированием.', points: ['Состав набора под бюджет', 'Логотип на коробке и открытке', 'Доставка по Казахстану'] },
  { id: 'audience', icon: Building2, kicker: 'Клиенты', title: 'Кому мы звоним', text: 'Компаниям Казахстана со штатом от 80 человек. Обычно решение начинают HR, office manager или закупки.', points: ['Уточните реального ЛПР', 'Не предполагайте бюджет', 'Учитывайте региональную доставку'] },
  { id: 'questions', icon: ClipboardCheck, kicker: 'Задача звонка', title: 'Что обязательно узнать', text: 'Успех первого звонка — не продажа, а корректная квалификация и согласованный следующий шаг.', points: ['Количество получателей', 'Бюджет и срок', 'Брендинг и процесс согласования'] },
  { id: 'limits', icon: LockKeyhole, kicker: 'Ограничения', title: 'Чего нельзя обещать', text: 'Не подтверждайте скидку, точный состав, наличие и срок производства до проверки менеджером.', points: ['Не давите на клиента', 'Не критикуйте поставщика', 'Не выдумывайте условия'] },
  { id: 'quality', icon: Star, kicker: 'Качество', title: 'Как оценивается разговор', text: 'Система оценивает ваши действия: вопросы, общение, квалификацию, возражения, результат и правила.', points: ['Отказ клиента не штраф', 'INVALID требует причины', 'Оценку можно оспорить'] },
  { id: 'payment', icon: CircleDollarSign, kicker: 'Оплата', title: 'Как рассчитывается начисление', text: 'Базовая ставка кампании умножается на коэффициент качества, затем добавляется бонус результата.', points: [`Ставка: ${formatMoney(campaign.baseCallRate)}`, 'Высокое качество: × 1,25', 'INVALID: всегда 0 ₸'] },
]

function OperatorOnboarding() {
  const completed = useAppStore((state) => state.onboardingCompleted)
  const completeStep = useAppStore((state) => state.completeOnboardingStep)
  const firstIncomplete = onboardingLessons.findIndex((lesson) => !completed.includes(lesson.id))
  const [step, setStep] = useState(firstIncomplete < 0 ? onboardingLessons.length - 1 : firstIncomplete)
  const lesson = onboardingLessons[step]
  const done = completed.includes(lesson.id)
  const progress = Math.round((completed.length / onboardingLessons.length) * 100)
  const advance = () => { completeStep(lesson.id); if (step < onboardingLessons.length - 1) setStep(step + 1) }
  return <>
    <PageHeader eyebrow="Быстрый старт" title="Подготовка оператора" description="Шесть коротких карточек — всё необходимое перед первой сменой." action={<span className="training-progress"><strong>{progress}%</strong> пройдено</span>} />
    <div className="onboarding-layout">
      <aside className="lesson-nav card"><div className="lesson-progress"><span><strong>{completed.length}</strong> из {onboardingLessons.length}</span><div><i style={{width:`${progress}%`}} /></div></div>{onboardingLessons.map((item, index) => <button key={item.id} onClick={() => setStep(index)} className={`${step === index ? 'active' : ''} ${completed.includes(item.id) ? 'done' : ''}`}><span>{completed.includes(item.id) ? <Check size={14}/> : index + 1}</span><div><small>{item.kicker}</small><strong>{item.title}</strong></div></button>)}</aside>
      <section className="lesson-card card"><div className="lesson-visual"><lesson.icon size={34}/><span>{String(step+1).padStart(2,'0')} / {String(onboardingLessons.length).padStart(2,'0')}</span></div><p className="eyebrow accent">{lesson.kicker}</p><h2>{lesson.title}</h2><p className="lesson-text">{lesson.text}</p><div className="lesson-points">{lesson.points.map((point) => <div key={point}><CheckCircle2 size={18}/><span>{point}</span></div>)}</div><div className="lesson-actions"><button className="button secondary" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft size={15}/> Назад</button>{step < onboardingLessons.length - 1 ? <button className="button primary" onClick={advance}>{done ? 'Далее' : 'Понятно, продолжить'} <ArrowRight size={15}/></button> : <Link className="button primary" to="/queue" onClick={() => completeStep(lesson.id)}><CheckCircle2 size={16}/> Перейти к очереди</Link>}</div></section>
      <aside className="training-side"><section className="card"><Sparkles size={20}/><h3>Главное правило</h3><p>Ваша задача — помочь клиенту и собрать точные данные. Отказ не означает плохую работу.</p></section><section className="card"><ShieldCheck size={20}/><h3>Безопасный demo</h3><p>Звонок, компании и контакты выдуманы. Реальная телефония не подключена.</p></section></aside>
    </div>
  </>
}

function CompanyQueue() {
  const [query, setQuery] = useState('')
  const [priority, setPriority] = useState('all')
  const completed = useAppStore((state) => state.completedDemo)
  const visible = companies.filter((company) => company.name.toLowerCase().includes(query.toLowerCase()) && (priority === 'all' || company.priority === priority))
  return <>
    <PageHeader eyebrow="Рабочая очередь" title="Компании для звонка" description="Очередь ранжирована по потенциалу и вероятности контакта." action={<div className="queue-count"><strong>{visible.length}</strong><span>доступно сейчас</span></div>} />
    <div className="queue-toolbar card"><label className="search-box"><Search size={18}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Найти компанию" /></label><div className="filter-tabs"><button className={priority === 'all' ? 'active' : ''} onClick={() => setPriority('all')}>Все</button><button className={priority === 'high' ? 'active' : ''} onClick={() => setPriority('high')}>Высокий</button><button className={priority === 'medium' ? 'active' : ''} onClick={() => setPriority('medium')}>Средний</button><button className={priority === 'low' ? 'active' : ''} onClick={() => setPriority('low')}>Низкий</button></div><button className="button secondary"><ListFilter size={16}/> Фильтры</button></div>
    <section className="queue-card card">
      <div className="queue-head"><span>Компания</span><span>AI Lead Score</span><span>Ценность</span><span>Enrichment</span><span>Приоритет</span><span>Действие</span></div>
      {visible.map((company, index) => { const companyCompleted = completed && company.id === 'astra'; const enrichment = enrichmentProfiles[company.id]; return <div className={`queue-row ${index === 0 && !completed ? 'featured' : ''}`} key={company.id}>
        <div className="company-cell"><span className="company-logo">{company.name.slice(0, 2).toUpperCase()}</span><div><Link to={`/companies/${company.id}`}>{company.name}</Link><small>{company.industry} · {company.city} · {company.employees} сотрудников</small></div></div>
        <div className="lead-score"><strong>{enrichment.leadScore}</strong><small>из 100 · высокий fit</small></div>
        <div><strong>{enrichment.potentialValue}</strong><small>{company.potential}</small></div>
        <div><span className={`enrichment-status ${enrichment.status.toLowerCase()}`}>{enrichment.status}</span><small>Уровень: {enrichment.recommendedLevel}</small></div>
        <div><span className={`priority ${company.priority}`}>{company.priority === 'high' ? 'Высокий' : company.priority === 'medium' ? 'Средний' : 'Низкий'}</span><small>{company.priorityReason}</small></div>
        <div>{companyCompleted ? <span className="status-pill success"><CheckCircle2 size={14}/> Заинтересован</span> : <Link className={`button ${index === 0 ? 'primary' : 'ghost'}`} to={`/companies/${company.id}`}>{index === 0 ? 'Подготовиться' : 'Открыть'} <ArrowRight size={15}/></Link>}</div>
      </div> })}
      {visible.length === 0 && <EmptyState icon={Search} title="Компании не найдены" text="Измените поиск или фильтр приоритета." />}
    </section>
  </>
}

function CompanyPage() {
  const { companyId = 'astra' } = useParams()
  const company = companies.find((item) => item.id === companyId) ?? companies[0]
  const enrichment = enrichmentProfiles[company.id]
  const completed = useAppStore((state) => state.completedDemo) && company.id === 'astra'
  return <>
    <div className="back-row"><Link to="/queue"><ArrowLeft size={16}/> К очереди</Link><span className={`status-pill ${completed ? 'success' : 'neutral'}`}>{completed ? 'Заинтересован' : 'В очереди'}</span></div>
    <section className="company-hero card"><div className="company-ident"><span className="company-logo large">{company.name.slice(0,2).toUpperCase()}</span><div><p className="eyebrow accent">Карточка компании</p><h1>{company.name}</h1><p>{company.industry} · {company.city} · {company.employees} сотрудников</p></div></div><Link className="button primary" to={`/calls/${company.id}/preparation`}><Sparkles size={17}/> Подготовиться к звонку</Link></section>
    <div className="detail-grid">
      <div className="detail-main">
        <section className="card insight-card"><div className="ai-heading"><span><Bot size={20}/></span><div><strong>AI-досье компании</strong><small>Demo-enrichment · уверенность {enrichment.confidence}%</small></div></div><p>{enrichment.description} Предполагаемая потребность: <strong>{company.need.toLowerCase()}</strong>.</p><div className="insight-tags"><span><Target size={15}/> Lead Score: {enrichment.leadScore}/100</span><span><Globe2 size={15}/> {enrichment.regions.join(' · ')}</span><span><Database size={15}/> {enrichment.status}</span></div></section>
        <section className="card"><div className="section-title"><div><h3>Контекст сделки</h3><p>Факты и гипотезы для первого разговора</p></div></div><div className="info-grid"><Info label="Примерный размер" value={`${company.employees} сотрудников`}/><Info label="Возможный ЛПР" value={enrichment.likelyDecisionMaker}/><Info label="Потенциальный объём" value={company.potential}/><Info label="Ценность сделки" value={enrichment.potentialValue}/><Info label="Почему актуально сейчас" value="Сезонное планирование обычно начинается заранее"/><Info label="Основной риск" value={company.risk}/></div></section>
        <section className="card enrichment-details"><div className="section-title"><div><h3>Найденные сигналы</h3><p>Вымышленные открытые данные для демонстрации</p></div><span className="confidence-badge">{enrichment.confidence}% уверенность</span></div><div className="signal-list">{enrichment.signals.map((signal) => <div key={signal}><TrendingUp size={16}/><span>{signal}</span></div>)}</div><div className="source-list">{enrichment.sources.map((source) => <div key={source.id}><span><Globe2 size={15}/></span><div><strong>{source.label}</strong><small>{source.kind} · проверено {source.checkedAt}</small></div><em>{source.confidence}%</em></div>)}</div></section>
        <section className="card unknown-card"><div className="section-title"><div><h3>Что пока неизвестно</h3><p>Превратите пробелы в вопросы во время звонка</p></div><AlertTriangle size={19}/></div><div className="unknown-list">{enrichment.unknowns.map((item) => <span key={item}>{item}</span>)}</div></section>
        <section className="card"><div className="section-title"><div><h3>История касаний</h3><p>Демонстрационные события</p></div></div><div className="timeline"><div><i/><span><strong>Компания добавлена в кампанию</strong><small>Сегодня, 09:12 · AI-сегментация</small></span></div><div><i/><span><strong>{company.lastTouch}</strong><small>Вчера, 16:40 · Система</small></span></div></div></section>
      </div>
      <aside className="detail-side"><section className="card contact-card"><div className="section-title"><div><h3>Контакт</h3><p>Предполагаемый ЛПР</p></div></div><div className="contact-avatar">АС</div><h3>{company.contact.name}</h3><p>{company.contact.position}</p><div className="contact-line"><Phone size={16}/><span>{company.contact.phone}</span><em>Demo</em></div></section><section className="card call-goal"><Target size={20}/><h3>Цель первого звонка</h3><p>Подтвердить потребность, объём, бюджет и срок. Согласовать отправку двух вариантов.</p></section></aside>
    </div>
  </>
}

function Info({ label, value }: { label: string; value: string }) { return <div className="info-item"><span>{label}</span><strong>{value}</strong></div> }

function CallPreparation() {
  const { companyId = 'astra' } = useParams()
  const company = companies.find((item) => item.id === companyId) ?? companies[0]
  const checks = useAppStore((state) => state.preparationChecks)
  const toggle = useAppStore((state) => state.togglePreparation)
  const startCall = useAppStore((state) => state.startCall)
  const navigate = useNavigate()
  const readyItems = ['context', 'script', 'environment']
  return <>
    <div className="back-row"><Link to={`/companies/${company.id}`}><ArrowLeft size={16}/> Карточка компании</Link><span className="status-pill ai"><Sparkles size={14}/> AI-подготовка готова</span></div>
    <PageHeader eyebrow="Подготовка к звонку" title={company.name} description="Короткий бриф поможет провести разговор уверенно и по правилам кампании." />
    <div className="prep-grid">
      <div className="prep-main">
        <section className="brief-hero card"><div className="ai-heading"><span><Bot size={20}/></span><div><strong>Главная задача разговора</strong><small>Рекомендация AI-копилота</small></div></div><h2>Заинтересовать сравнением двух вариантов без обязательств</h2><p>Не пытайтесь заменить текущего поставщика. Предложите полезную альтернативу и выясните параметры заказа.</p></section>
        <section className="card"><div className="section-title"><div><h3>Рекомендуемое вступление</h3><p>Можно адаптировать под свой стиль</p></div><button className="tiny-action">Скопировать</button></div><blockquote>«Алия, добрый день! Меня зовут Дана, компания ZVONA Gifts. Мы помогаем HR-командам собрать корпоративные наборы под бюджет и доставить их по Казахстану. Удобно две минуты?»</blockquote></section>
        <section className="card"><div className="section-title"><div><h3>Обязательные вопросы</h3><p>Без них звонок не получит максимальную оценку</p></div><span className="count-badge">5 вопросов</span></div><div className="question-list">{['Сколько получателей планируется?', 'Какой бюджет на один набор?', 'К какой дате всё должно быть готово?', 'Нужен ли логотип на упаковке?', 'Какой следующий шаг будет удобен?'].map((item, i) => <div key={item}><span>{i+1}</span><p>{item}</p></div>)}</div></section>
        <section className="card prep-rules"><div><div className="section-title"><div><h3>Критерии успешного звонка</h3><p>Достаточно квалификации и следующего шага</p></div><CheckCircle2 size={19}/></div><ul><li>Найден или подтверждён ЛПР</li><li>Получены объём, бюджет и срок</li><li>Результат точно отражает разговор</li></ul></div><div><div className="section-title"><div><h3>Запрещённые обещания</h3><p>Передайте уточнение менеджеру</p></div><LockKeyhole size={19}/></div><ul><li>Не обещайте скидку и точную цену</li><li>Не подтверждайте наличие без проверки</li><li>Не гарантируйте срок производства</li></ul></div></section>
      </div>
      <aside className="prep-side"><section className="card risk-card"><div className="section-title"><div><h3>Вероятное возражение</h3><p>Подготовьтесь заранее</p></div><AlertTriangle size={20}/></div><strong>«У нас уже есть поставщик»</strong><p>Не спорьте. Признайте ценность существующего партнёра и предложите один вариант для спокойного сравнения.</p></section><section className="card ready-card"><h3>Готовность к звонку</h3><p>Подтвердите перед стартом</p>{[['context','Изучила контекст компании'],['script','Понимаю цель и сценарий'],['environment','Готова говорить без помех']].map(([id,label]) => <label key={id}><input type="checkbox" checked={checks.includes(id)} onChange={() => toggle(id)}/><span><Check size={13}/></span>{label}</label>)}<button className="button primary full" disabled={!readyItems.every((id) => checks.includes(id))} onClick={() => { startCall(); navigate('/calls/demo-call/live') }}><Phone size={18}/> Начать demo-звонок</button><small className="safety-note"><ShieldCheck size={14}/> Реальный звонок не совершается</small></section></aside>
    </div>
  </>
}

const requiredQuestions = [
  { id: 'contact', label: 'Подтвердить ЛПР' }, { id: 'need', label: 'Выявить потребность' }, { id: 'budget', label: 'Объём и бюджет' }, { id: 'deadline', label: 'Срок и брендинг' }, { id: 'nextStep', label: 'Следующий шаг' },
]

function LiveCall() {
  const step = useAppStore((state) => state.callStep)
  const setStep = useAppStore((state) => state.setCallStep)
  const running = useAppStore((state) => state.callRunning)
  const toggleCall = useAppStore((state) => state.toggleCall)
  const elapsed = useAppStore((state) => state.elapsed)
  const setElapsed = useAppStore((state) => state.setElapsed)
  const completedQuestions = useAppStore((state) => state.completedQuestions)
  const completeQuestion = useAppStore((state) => state.completeQuestion)
  const resetCall = useAppStore((state) => state.resetCall)
  const navigate = useNavigate()
  const current = transcript[step]
  useEffect(() => { if (current.completes) completeQuestion(current.completes) }, [current.completes, completeQuestion])
  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      setElapsed(elapsed + 1)
      if ((elapsed + 1) % 5 === 0 && step < transcript.length - 1) setStep(step + 1)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [running, elapsed, step, setElapsed, setStep])
  const reset = () => resetCall()
  const time = `${String(Math.floor(elapsed / 60)).padStart(2,'0')}:${String(elapsed % 60).padStart(2,'0')}`
  const missingInformation = requiredQuestions.filter((item) => !completedQuestions.includes(item.id)).map((item) => item.label)
  return <div className="call-screen">
    <header className="call-topbar"><div className="call-brand"><span className="brand-mark">Z</span><span><strong>ZVONA</strong><small>AI-сопровождение звонка</small></span></div><div className="call-status"><span className={`status-pill ${running ? 'live' : 'neutral'}`}><span/> {running ? 'Разговор идёт' : 'На паузе'}</span><strong>{time}</strong><span className="demo-badge">DEMO</span></div><div className="call-controls"><button className="icon-button" onClick={reset} aria-label="Сбросить"><RotateCcw size={17}/></button><button className="button secondary" onClick={toggleCall}>{running ? <><Pause size={17}/> Пауза</> : <><Play size={17}/> Продолжить</>}</button><button className="button danger" onClick={() => navigate('/calls/demo-call/complete')}><Square size={15}/> Завершить</button></div></header>
    <div className="call-layout">
      <aside className="call-left"><section className="call-company"><div className="company-logo large">AL</div><div><p className="eyebrow">Компания</p><h2>Astra Logistics</h2><span>Логистика · Алматы</span></div></section><section><p className="call-label">Контакт</p><div className="call-contact"><div className="contact-avatar small">АС</div><div><strong>Алия Садыкова</strong><span>Руководитель отдела персонала</span></div></div></section><section><p className="call-label">Цель звонка</p><p className="call-copy">Выяснить объём, бюджет и срок. Согласовать отправку двух вариантов.</p></section><section><p className="call-label">Текущий этап</p><div className="stage-card"><span>{step+1}</span><div><strong>{current.stage}</strong><small>Шаг {step+1} из {transcript.length}</small></div></div><div className="stage-progress"><i style={{width:`${((step+1)/transcript.length)*100}%`}}/></div></section><section className="context-note"><Sparkles size={16}/><p><strong>Контекст</strong>У компании есть поставщик. Цель — предложить сравнение, не давить.</p></section></aside>
      <main className="call-center"><div className="transcript-header"><div><p className="eyebrow">Live transcript</p><h2>Разговор</h2></div><span><Activity size={15}/> AI слушает</span></div><div className="transcript-list">{transcript.slice(0, step+1).map((line, index) => <div className={`transcript-line ${line.speaker} ${index === step ? 'current' : ''}`} key={index}><div className="speaker"><span>{line.speaker === 'operator' ? 'ДМ' : 'АС'}</span><div><strong>{line.speaker === 'operator' ? 'Вы' : 'Алия'}</strong><small>{line.time}</small></div></div><p>{line.text}</p></div>)}</div><section className="say-now"><div className="say-label"><span><Sparkles size={17}/></span><strong>Скажите сейчас</strong><em>AI-подсказка</em></div><p>{current.sayNow}</p><div className="say-actions"><button className="button ghost" onClick={() => step < transcript.length-1 && setStep(step+1)}>Следующая реплика <ArrowRight size={15}/></button></div></section></main>
      <aside className="call-right"><section className="copilot-title"><span><Bot size={19}/></span><div><strong>AI-копилот</strong><small>Подсказки в реальном времени</small></div></section><section className="next-question"><p className="call-label">Следующий лучший вопрос</p><MessageSquareQuote size={20}/><strong>{current.nextQuestion}</strong></section>{current.objection && <section className="objection-card"><div><AlertTriangle size={17}/><strong>Обнаружено возражение</strong></div><h3>{current.objection}</h3><p className="call-label">Рекомендуемый ответ</p><blockquote>{current.answer}</blockquote></section>}<section className="required-card"><div className="required-head"><div><p className="call-label">Обязательные вопросы</p><strong>{completedQuestions.filter(id => requiredQuestions.some(q => q.id === id)).length} из 5</strong></div><div className="mini-progress"><i style={{width:`${(completedQuestions.filter(id => requiredQuestions.some(q => q.id === id)).length/5)*100}%`}}/></div></div>{requiredQuestions.map((q) => <div className={`required-row ${completedQuestions.includes(q.id) ? 'done' : ''}`} key={q.id}><span>{completedQuestions.includes(q.id) ? <Check size={13}/> : null}</span><p>{q.label}</p></div>)}</section><section className="missing-card"><p className="call-label">Недостающая информация</p>{missingInformation.length ? missingInformation.slice(0, 3).map((item) => <span key={item}><AlertTriangle size={12}/>{item}</span>) : <span className="all-complete"><CheckCircle2 size={13}/> Всё обязательное собрано</span>}{step >= 7 && missingInformation.length > 0 && <div className="step-warning">Не завершайте звонок, пока не уточните отмеченные пункты.</div>}</section><button className="result-button" onClick={() => navigate('/calls/demo-call/complete')}>Выбрать результат звонка <ArrowRight size={16}/></button></aside>
    </div>
  </div>
}

const outcomeLabels: Record<OutcomeType, { label: string; desc: string }> = {
  interested: { label: 'Заинтересован', desc: 'Передать менеджеру' },
  proposal: { label: 'Отправить предложение', desc: 'Подготовить варианты' },
  callback: { label: 'Перезвонить', desc: 'Согласовать дату' },
  supplier_selected: { label: 'Уже выбрали поставщика', desc: 'Корректно закрыть' },
  other_contact: { label: 'Нужен другой сотрудник', desc: 'Зафиксировать контакт' },
  not_relevant: { label: 'Неактуально', desc: 'Закрыть контакт' },
  wrong_contact: { label: 'Неверный контакт', desc: 'Уточнить данные' },
  no_answer: { label: 'Не дозвонились', desc: 'Вернуть в очередь' },
}

function CallCompletion() {
  const navigate = useNavigate()
  const finishCall = useAppStore((state) => state.finishCall)
  const [outcome, setOutcome] = useState<OutcomeType>('interested')
  const [validity, setValidity] = useState<CallValidity>('VALID')
  const [invalidReason, setInvalidReason] = useState('')
  const [comment, setComment] = useState('Клиент ждёт два варианта сегодня до 17:00. Важны логотип и доставка в Алматы.')
  const [decisionMakerName, setDecisionMakerName] = useState('Алия Садыкова')
  const [decisionMakerRole, setDecisionMakerRole] = useState('Руководитель отдела персонала')
  const [contactValue, setContactValue] = useState('aliya@demo-company.kz')
  const [callbackAt, setCallbackAt] = useState('2026-07-15T15:30')
  const needsQualification = ['interested', 'proposal', 'callback'].includes(outcome)
  const contradiction = ['supplier_selected', 'not_relevant', 'wrong_contact', 'no_answer'].includes(outcome)
  const submit = (event: FormEvent) => { event.preventDefault(); if (validity === 'INVALID' && !invalidReason) return; const result: CallResult = { outcome, quantity: needsQualification ? 300 : 0, budget: needsQualification ? '30 000 ₸' : '', deadline: needsQualification ? '10 декабря' : '', comment, validity, invalidReason, decisionMakerName, decisionMakerRole, contactValue, callbackAt: outcome === 'callback' ? callbackAt : undefined }; finishCall(result); navigate('/calls/demo-call/quality') }
  return <>
    <div className="back-row"><Link to="/calls/demo-call/live"><ArrowLeft size={16}/> Вернуться к звонку</Link><span className="status-pill neutral"><Clock3 size={14}/> 01:52 · завершён</span></div>
    <PageHeader eyebrow="Завершение звонка" title="Зафиксируйте результат" description="Проверьте квалификацию и выберите корректный статус разговора." />
    <form onSubmit={submit} className="completion-layout"><div className="completion-main"><section className="card"><div className="section-title"><div><h3>Результат звонка</h3><p>Выберите один наиболее точный вариант</p></div></div><div className="outcome-grid">{Object.entries(outcomeLabels).map(([key, item]) => <button type="button" onClick={() => setOutcome(key as OutcomeType)} className={`outcome-option ${outcome === key ? 'selected' : ''}`} key={key}><span>{outcome === key && <Check size={14}/>}</span><div><strong>{item.label}</strong><small>{item.desc}</small></div></button>)}</div></section>
      {contradiction && <div className="transcript-warning"><AlertTriangle size={20}/><div><strong>Результат противоречит demo-транскрипту</strong><p>Клиент подтвердил интерес и попросил отправить варианты. Проверьте выбранный статус или отметьте звонок для ручной проверки.</p></div></div>}
      <section className="card"><div className="section-title"><div><h3>{needsQualification ? 'Квалификация и ЛПР' : 'Детали результата'}</h3><p>{needsQualification ? 'AI заполнил данные из demo-транскрипта' : 'Заполните только данные, относящиеся к результату'}</p></div><span className="status-pill ai"><Sparkles size={14}/> Умная форма</span></div>{needsQualification && <><div className="form-grid"><label>Имя ЛПР<input value={decisionMakerName} onChange={(e) => setDecisionMakerName(e.target.value)} required /></label><label>Должность ЛПР<input value={decisionMakerRole} onChange={(e) => setDecisionMakerRole(e.target.value)} required /></label><label>Телефон или email<input value={contactValue} onChange={(e) => setContactValue(e.target.value)} required /></label><label>Количество сотрудников<input defaultValue="320" required /></label><label>Количество наборов<input defaultValue="300" required /></label><label>Бюджет за набор<input defaultValue="30 000 ₸" required /></label><label>Срок решения<input defaultValue="10 декабря" required /></label><label>Брендинг<input defaultValue="Логотип на коробке и открытке" /></label></div>{outcome === 'callback' && <label className="form-label callback-field">Дата повторного контакта<input type="datetime-local" value={callbackAt} onChange={(e) => setCallbackAt(e.target.value)} required /></label>}</>} {outcome === 'other_contact' && <div className="form-grid"><label>Имя нужного сотрудника<input value={decisionMakerName} onChange={(e) => setDecisionMakerName(e.target.value)} required /></label><label>Должность<input value={decisionMakerRole} onChange={(e) => setDecisionMakerRole(e.target.value)} required /></label><label>Телефон или email<input value={contactValue} onChange={(e) => setContactValue(e.target.value)} required /></label></div>}<label className="form-label">Комментарий оператора<textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} required={['supplier_selected','not_relevant','wrong_contact'].includes(outcome)}/></label></section></div>
      <aside className="completion-side"><section className="card validity-card"><div className="section-title"><div><h3>Валидность звонка</h3><p>Demo-решение системы</p></div></div>{(['VALID','REVIEW_REQUIRED','INVALID'] as CallValidity[]).map((item) => <label className={`validity-option ${validity === item ? 'selected' : ''}`} key={item}><input type="radio" name="validity" checked={validity === item} onChange={() => setValidity(item)}/><span className={`validity-icon ${item.toLowerCase()}`}>{item === 'VALID' ? <CheckCircle2/> : item === 'INVALID' ? <XCircle/> : <AlertTriangle/>}</span><div><strong>{item}</strong><small>{item === 'VALID' ? 'Правила выполнены' : item === 'INVALID' ? 'Начисление будет 0 ₸' : 'Нужна ручная проверка'}</small></div></label>)}{validity === 'INVALID' && <label className="form-label invalid-reason">Причина недействительности<select value={invalidReason} onChange={(e) => setInvalidReason(e.target.value)} required><option value="">Выберите причину</option><option>Разговор не состоялся</option><option>Неверно указан результат</option><option>Критическое нарушение правил</option><option>Недостаточно данных для подтверждения</option></select></label>}<div className="validity-hint"><ShieldCheck size={17}/><p>{validity === 'REVIEW_REQUIRED' ? 'Начисление предварительное до решения контролёра.' : validity === 'INVALID' ? 'Для INVALID причина обязательна и будет видна в оценке.' : 'Разговор соответствует обязательным правилам кампании.'}</p></div></section><button className="button primary full large" type="submit"><FileCheck2 size={18}/> Сохранить и оценить</button><p className="submit-note">После сохранения система рассчитает качество и начисление.</p></aside></form>
  </>
}

const qualityScore = calculateQualityScore(qualityItems)

function QualityReview() {
  const result = useAppStore((state) => state.callResult) ?? { outcome: 'interested' as OutcomeType, quantity: 300, budget: '30 000 ₸', deadline: '10 декабря', comment: '', validity: 'VALID' as CallValidity, invalidReason: '' }
  const disputed = useAppStore((state) => state.disputed)
  const submitDispute = useAppStore((state) => state.submitDispute)
  const [showDispute, setShowDispute] = useState(false)
  const [comment, setComment] = useState('')
  const bonus = campaign.outcomeBonuses[result.outcome]
  const payment = calculatePayout(campaign.baseCallRate, qualityScore, bonus, result.validity)
  const submit = (event: FormEvent) => { event.preventDefault(); if (!comment.trim()) return; submitDispute(comment); setShowDispute(false) }
  return <>
    <div className="back-row"><Link to="/queue"><ArrowLeft size={16}/> Вернуться в очередь</Link><span className={`status-pill validity-${result.validity.toLowerCase()}`}>{result.validity === 'VALID' ? <CheckCircle2 size={14}/> : result.validity === 'INVALID' ? <XCircle size={14}/> : <AlertTriangle size={14}/>} {result.validity}</span></div>
    <PageHeader eyebrow="AI-оценка качества" title="Разговор оценён" description="Astra Logistics · Алия Садыкова · сегодня, 11:24" action={<Link className="button primary" to="/operator">Мой кабинет <ArrowRight size={16}/></Link>} />
    {result.validity === 'INVALID' && <div className="invalid-banner"><XCircle size={22}/><div><strong>Звонок признан недействительным</strong><p>Причина: {result.invalidReason || 'Причина не указана'}. Начисление по этому звонку равно 0 ₸.</p></div></div>}
    {result.validity === 'REVIEW_REQUIRED' && <div className="review-banner"><AlertTriangle size={22}/><div><strong>Требуется ручная проверка</strong><p>Начисление показано предварительно и может измениться после решения контролёра качества.</p></div></div>}
    {disputed && <div className="dispute-banner"><ClipboardCheck size={21}/><div><strong>Апелляция отправлена</strong><p>Звонок получил статус disputed и появился в очереди контролёра качества.</p></div></div>}
    <div className="quality-top"><section className="card score-card"><div className="score-ring" style={{'--score': qualityScore} as React.CSSProperties}><div><strong>{qualityScore}</strong><span>из 100</span></div></div><div><span className="status-pill success"><Star size={14}/> Отличная работа</span><h2>Сильный и корректный разговор</h2><p>Вы выяснили ключевые параметры, спокойно отработали возражение и согласовали конкретный следующий шаг.</p></div></section><section className={`card payment-card ${result.validity === 'INVALID' ? 'invalid' : ''}`}><div className="payment-icon"><CircleDollarSign size={24}/></div><div><p>Начисление за звонок</p><strong>{formatMoney(payment)}</strong><span>{result.validity === 'REVIEW_REQUIRED' ? 'Предварительно' : result.validity === 'INVALID' ? 'Не начислено' : 'Будет добавлено в баланс'}</span></div><div className="payment-formula"><div><span>Базовая ставка</span><strong>{formatMoney(campaign.baseCallRate)}</strong></div><div><span>Множитель качества</span><strong>× {payoutCoefficient(qualityScore)}</strong></div><div><span>Бонус за результат</span><strong>+ {formatMoney(bonus)}</strong></div></div></section></div>
    <div className="quality-grid"><section className="card"><div className="section-title"><div><h3>Детали оценки</h3><p>Критерии и вклад в итоговый балл</p></div></div><div className="quality-list">{qualityItems.map((item) => <div className="quality-row" key={item.label}><div className="quality-name"><strong>{item.label}</strong><small>{item.note}</small></div><div className="quality-bar"><i style={{width:`${item.score}%`}}/></div><strong>{item.score}</strong><span>{item.weight}%</span></div>)}</div></section><aside><section className="card feedback-card"><div className="feedback-title positive"><CheckCircle2 size={18}/><strong>Что получилось особенно хорошо</strong></div><ul><li>Подтвердили объём, бюджет и срок.</li><li>Не спорили с возражением о поставщике.</li><li>Назначили конкретный следующий шаг.</li></ul><div className="feedback-title improve"><Sparkles size={18}/><strong>Совет на следующий звонок</strong></div><p>Чуть раньше уточняйте, кто участвует в финальном согласовании бюджета.</p></section><button className="button secondary full dispute-action" onClick={() => setShowDispute(true)} disabled={disputed}><MessageSquareQuote size={17}/>{disputed ? 'Апелляция отправлена' : 'Оспорить оценку'}</button></aside></div>
    {showDispute && <div className="modal-backdrop" onMouseDown={() => setShowDispute(false)}><form className="modal card" onSubmit={submit} onMouseDown={(e) => e.stopPropagation()}><div className="modal-icon"><MessageSquareQuote size={22}/></div><h2>Оспорить оценку</h2><p>Опишите, с каким критерием или выводом вы не согласны. Комментарий увидит контролёр качества.</p><label className="form-label">Комментарий<textarea autoFocus value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Например: в разговоре был уточнён бюджет…" rows={5}/></label><div className="modal-actions"><button type="button" className="button ghost" onClick={() => setShowDispute(false)}>Отмена</button><button className="button primary" disabled={!comment.trim()}>Отправить апелляцию</button></div></form></div>}
  </>
}

function OperatorCabinet() {
  const completed = useAppStore((state) => state.completedDemo)
  const result = useAppStore((state) => state.callResult)
  const bonus = result ? campaign.outcomeBonuses[result.outcome] : 0
  const latestPayment = result ? calculatePayout(campaign.baseCallRate, qualityScore, bonus, result.validity) : 0
  return <><PageHeader eyebrow="Личный кабинет" title="Дана Муратова" description="Результаты смены, качество и персональные рекомендации." action={<Link className="button primary" to="/queue"><Phone size={17}/> Вернуться в очередь</Link>}/><div className="stats-grid"><StatCard label="Звонки за смену" value={completed ? '25' : '24'} detail="План: 32" icon={Phone}/><StatCard label="Среднее качество" value={completed ? '92' : '91'} detail="Топ-15% команды" icon={Star} tone="amber"/><StatCard label="Конверсия в интерес" value="29%" detail="7 заинтересованных" icon={TrendingUp} tone="green"/><StatCard label="Начислено сегодня" value={formatMoney(28750 + latestPayment)} detail={completed ? `Последний звонок: +${formatMoney(latestPayment)}` : '24 валидных звонка'} icon={CircleDollarSign} tone="blue"/></div><div className="dashboard-grid"><section className="card"><div className="section-title"><div><h3>Последние звонки</h3><p>Результат и оценка качества</p></div></div><div className="simple-table">{completed && <div><span className="company-logo">AL</span><div><strong>Astra Logistics</strong><small>Только что · Заинтересован</small></div><b>{qualityScore}</b><em>{formatMoney(latestPayment)}</em></div>}<div><span className="company-logo">QB</span><div><strong>QazBuild Group</strong><small>Сегодня, 10:42 · Перезвон</small></div><b>89</b><em>1 200 ₸</em></div><div><span className="company-logo">NF</span><div><strong>Nomad Finance</strong><small>Сегодня, 10:08 · Нет ответа</small></div><b>82</b><em>1 000 ₸</em></div></div></section><section className="card feedback-card"><div className="feedback-title improve"><Sparkles size={18}/><strong>Фокус на сегодня</strong></div><h3>Уточняйте процесс согласования</h3><p>После бюджета задавайте вопрос: «Кто ещё участвует в выборе и что для него будет важно?»</p><div className="goal-progress"><span><strong>25</strong> из 32 звонков</span><div><i style={{width:'78%'}}/></div></div></section></div></>
}

function Payouts() {
  const result = useAppStore((state) => state.callResult)
  const payment = result ? calculatePayout(campaign.baseCallRate, qualityScore, campaign.outcomeBonuses[result.outcome], result.validity) : 0
  return <><PageHeader eyebrow="Начисления" title="Прозрачная оплата за качество" description="Каждое начисление показывает ставку, множитель и бонус результата."/><div className="stats-grid two"><StatCard label="Начислено сегодня" value={formatMoney(28750 + payment)} detail="Вывод средств недоступен в demo" icon={WalletCards}/><StatCard label="Базовая ставка кампании" value={formatMoney(campaign.baseCallRate)} detail="Хранится в Campaign.baseCallRate" icon={CircleDollarSign} tone="blue"/></div><section className="card"><div className="section-title"><div><h3>Последние начисления</h3><p>Демонстрационная история</p></div></div><div className="payout-table"><div className="table-head"><span>Компания</span><span>Валидность</span><span>Качество</span><span>Формула</span><span>Итого</span></div>{result && <div><strong>Astra Logistics</strong><span className={`status-pill validity-${result.validity.toLowerCase()}`}>{result.validity}</span><span>{qualityScore}/100</span><span>{formatMoney(campaign.baseCallRate)} × {payoutCoefficient(qualityScore)} + {formatMoney(campaign.outcomeBonuses[result.outcome])}</span><strong>{formatMoney(payment)}</strong></div>}<div><strong>QazBuild Group</strong><span className="status-pill validity-valid">VALID</span><span>89/100</span><span>1 000 ₸ × 1.0 + 200 ₸</span><strong>1 200 ₸</strong></div><div><strong>Nomad Finance</strong><span className="status-pill validity-valid">VALID</span><span>82/100</span><span>1 000 ₸ × 1.0 + 0 ₸</span><strong>1 000 ₸</strong></div></div></section></>
}

function QualityPlaceholder() {
  const disputed = useAppStore((state) => state.disputed)
  const disputeComment = useAppStore((state) => state.disputeComment)
  return <><PageHeader eyebrow="Контроль качества" title="Очередь ручной проверки" description="Полноценное рабочее место контролёра появится на следующем этапе."/><section className="placeholder-hero card"><div className="placeholder-icon"><ShieldCheck size={28}/></div><div><span className="status-pill ai">Маршрут подготовлен</span><h2>{disputed ? 'Получена новая апелляция' : 'Расширенный контроль качества — следующий этап'}</h2><p>{disputed ? 'Дана Муратова оспорила оценку звонка Astra Logistics. Локальная demo-заявка готова к будущей ручной проверке.' : 'Здесь будут фильтры, прослушивание, ручная оценка и решения по апелляциям.'}</p>{disputed && <div className="appeal-ticket"><div><strong>Astra Logistics · disputed</strong><span>Оператор: Дана Муратова</span></div><blockquote>«{disputeComment}»</blockquote><button className="button secondary" disabled>Открыть проверку · скоро</button></div>}</div></section></>
}

const placeholders = {
  operators: { eyebrow: 'Команда', title: 'Операторы', text: 'Каталог операторов, статусы смен и зоны развития появятся после завершения вертикального сценария.', icon: UsersRound },
  analytics: { eyebrow: 'Кампания', title: 'Расширенная аналитика', text: 'Воронка, возражения и сравнение операторов запланированы на следующий этап.', icon: BarChart3 },
  handoffs: { eyebrow: 'Продажи', title: 'Переданные лиды', text: 'Заинтересованные компании будут появляться здесь после handoff из звонка.', icon: BriefcaseBusiness },
}

function Placeholder({ kind }: { kind: keyof typeof placeholders }) {
  const item = placeholders[kind]
  return <><PageHeader eyebrow={item.eyebrow} title={item.title} description={item.text}/><section className="placeholder-hero card"><div className="placeholder-icon"><item.icon size={30}/></div><div><span className="status-pill neutral">Следующий этап</span><h2>Структура раздела уже заложена</h2><p>Сейчас фокус продукта — полный путь одного звонка от очереди до оценки и начисления.</p><Link className="button primary" to="/queue">Пройти основной сценарий <ArrowRight size={16}/></Link></div></section></>
}

function EmptyState({ icon: Icon, title, text }: { icon: typeof Search; title: string; text: string }) { return <div className="empty-state"><Icon size={26}/><strong>{title}</strong><p>{text}</p></div> }

export default App
