'use client'

import { useMemo, useState, type ChangeEvent } from 'react'
import {
  ArrowLeft, ArrowRight, BarChart3, BriefcaseBusiness, Building2, Check, ChevronRight,
  CircleAlert, CircleDollarSign, ClipboardCheck, FileSpreadsheet, Gauge, Headphones,
  LayoutDashboard, ListChecks, Phone, Play, Search, Sparkles, Target, Upload, UserRound,
  Users, X,
} from 'lucide-react'
import { demoAccounts, demoCampaign } from '@/lib/fixtures'
import { importAccountsFile } from '@/lib/excel-import'
import type { Account, Campaign } from '@/lib/domain'

type Role = 'manager' | 'operator'
type View = 'overview' | 'companies' | 'campaign' | 'results' | 'company' | 'onboarding' | 'shift' | 'queue' | 'earnings' | 'call' | 'qa'
type CallResult = {
  accountId: string
  outcome: string
  notes: string
  decisionMaker: boolean
  activeNeed: boolean
  agreedNextStep: boolean
  quality: number
  payout: number
  completedAt: string
}

const managerNav = [
  { id: 'overview' as const, label: 'Главная', icon: LayoutDashboard },
  { id: 'companies' as const, label: 'Компании', icon: Building2 },
  { id: 'campaign' as const, label: 'Кампания', icon: Target },
  { id: 'results' as const, label: 'Результаты', icon: BarChart3 },
]

const operatorNav = [
  { id: 'shift' as const, label: 'Моя смена', icon: Gauge },
  { id: 'queue' as const, label: 'Мои звонки', icon: Phone },
  { id: 'earnings' as const, label: 'Заработок', icon: CircleDollarSign },
]

const money = (value: number) => `${new Intl.NumberFormat('ru-RU').format(value)} ₸`

export function OperationsApp() {
  const [role, setRole] = useState<Role>('manager')
  const [view, setView] = useState<View>('overview')
  const [campaign, setCampaign] = useState<Campaign>(demoCampaign)
  const [accounts, setAccounts] = useState<Account[]>(demoAccounts)
  const [queue, setQueue] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState('astra')
  const [results, setResults] = useState<CallResult[]>([])
  const [lastResult, setLastResult] = useState<CallResult | null>(null)
  const [onboardingStep, setOnboardingStep] = useState(1)
  const [toast, setToast] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [importNote, setImportNote] = useState('')

  const selected = accounts.find(account => account.id === selectedId) ?? accounts[0]
  const queuedAccounts = queue.map(id => accounts.find(account => account.id === id)).filter((account): account is Account => Boolean(account))
  const enriched = accounts.filter(account => account.aiSummary).length
  const ready = accounts.filter(account => account.contacts.length > 0).length
  const qualified = results.filter(result => result.decisionMaker && result.activeNeed && result.agreedNextStep).length
  const earnings = results.reduce((sum, result) => sum + result.payout, 0)
  const nextAfterCall = queuedAccounts[0] ?? accounts.find(account => account.id !== selected.id && !results.some(result => result.accountId === account.id))

  const flash = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  const switchRole = (next: Role) => {
    setRole(next)
    setView(next === 'manager' ? 'overview' : 'shift')
  }

  const openCompany = (id: string) => {
    setSelectedId(id)
    setRole('manager')
    setView('company')
  }

  const addToQueue = (id: string, open = true) => {
    setQueue(current => current.includes(id) ? current : [...current, id])
    flash('Компания добавлена в очередь звонков')
    if (open) {
      setRole('operator')
      setView('queue')
    }
  }

  const startCall = (id: string) => {
    setSelectedId(id)
    setQueue(current => current.includes(id) ? current : [...current, id])
    setRole('operator')
    setView('call')
  }

  const completeCall = (input: Omit<CallResult, 'accountId' | 'quality' | 'payout' | 'completedAt'>) => {
    const evidenceCount = Number(input.decisionMaker) + Number(input.activeNeed) + Number(input.agreedNextStep)
    const quality = 64 + evidenceCount * 10
    const result: CallResult = {
      ...input,
      accountId: selected.id,
      quality,
      payout: quality >= 90 ? 1750 : quality >= 80 ? 1350 : 900,
      completedAt: new Date().toISOString(),
    }
    setResults(current => [result, ...current.filter(item => item.accountId !== selected.id)])
    setQueue(current => current.filter(id => id !== selected.id))
    setLastResult(result)
    setView('qa')
  }

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportError('')
    try {
      const imported = await importAccountsFile(file)
      setAccounts(imported.accounts)
      setQueue([])
      setResults([])
      setSelectedId(imported.accounts[0].id)
      setImportNote(`${file.name} · ${imported.accounts.length} компаний · лист «${imported.sheetName}»`)
      setRole('manager')
      setView('companies')
      flash(`Загружено компаний: ${imported.accounts.length}`)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Не удалось прочитать файл')
    } finally {
      setImporting(false)
      event.target.value = ''
    }
  }

  const openExample = () => {
    setAccounts(demoAccounts)
    setQueue([])
    setResults([])
    setSelectedId('astra')
    setImportNote('Готовый пример · 3 компании')
    setRole('manager')
    setView('companies')
    flash('Открыт готовый пример кампании')
  }

  const nav = role === 'manager' ? managerNav : operatorNav

  return <div className="app-shell">
    <aside className="sidebar">
      <button className="brand" onClick={() => { setRole('manager'); setView('overview') }}><span>Z</span><strong>ZVONA<small>команда продаж</small></strong></button>
      <div className="role-switch" aria-label="Роль в демо">
        <button className={role === 'manager' ? 'active' : ''} onClick={() => switchRole('manager')}>Руководитель</button>
        <button className={role === 'operator' ? 'active' : ''} onClick={() => switchRole('operator')}>Оператор</button>
      </div>
      <nav aria-label="Основная навигация">{nav.map(item => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => setView(item.id)}><item.icon size={18}/>{item.label}</button>)}</nav>
      <div className="sidebar-campaign"><span>Текущая кампания</span><strong>{campaign.name}</strong><small>{accounts.length} компаний в работе</small></div>
      <div className="sidebar-foot"><span className="demo-dot"/><span>Демонстрационный режим<small>Реальные звонки не выполняются</small></span></div>
    </aside>

    <section className="workspace-main">
      <header className="topbar">
        <div><span className="crumb">{role === 'manager' ? 'Кабинет руководителя' : 'Рабочее место оператора'}</span><strong>{nav.find(item => item.id === view)?.label ?? (view === 'company' ? 'Карточка компании' : view === 'call' ? 'Демонстрационный звонок' : view === 'qa' ? 'Разбор звонка' : 'Запуск кампании')}</strong></div>
        <div className="top-actions"><span className="demo-badge"><Sparkles size={14}/> Демо на выдуманных данных</span><button className="avatar" aria-label="Профиль">ДМ</button></div>
      </header>

      <main id="main" className="content">
        {view === 'overview' && <ManagerHome accounts={accounts} enriched={enriched} ready={ready} results={results} qualified={qualified} onContinue={() => { setOnboardingStep(1); setView('onboarding') }} onCompanies={() => setView('companies')} />}
        {view === 'companies' && <CompaniesView accounts={accounts} importNote={importNote} onOpen={openCompany} onImport={() => { setOnboardingStep(3); setView('onboarding') }} />}
        {view === 'campaign' && <CampaignView campaign={campaign} accounts={accounts} onChange={setCampaign} onImport={() => { setOnboardingStep(3); setView('onboarding') }} />}
        {view === 'results' && <ResultsView results={results} accounts={accounts} onContinue={() => switchRole('operator')} />}
        {view === 'company' && <CompanyView account={selected} queued={queue.includes(selected.id)} onBack={() => setView('companies')} onQueue={() => addToQueue(selected.id)} onCall={() => startCall(selected.id)} />}
        {view === 'onboarding' && <Onboarding step={onboardingStep} campaign={campaign} importing={importing} error={importError} onStep={setOnboardingStep} onCampaign={setCampaign} onImport={handleImport} onExample={openExample} onClose={() => setView('overview')} />}
        {view === 'shift' && <ShiftView queue={queuedAccounts} results={results} earnings={earnings} onStart={() => queuedAccounts[0] ? startCall(queuedAccounts[0].id) : setView('queue')} onQueue={() => setView('queue')} />}
        {view === 'queue' && <CallQueue accounts={queuedAccounts} allAccounts={accounts} onStart={startCall} onOpen={openCompany} />}
        {view === 'earnings' && <EarningsView results={results} accounts={accounts} total={earnings} />}
        {view === 'call' && <OperatorCall account={selected} onBack={() => setView('queue')} onComplete={completeCall} />}
        {view === 'qa' && lastResult && <QaView result={lastResult} account={selected} next={nextAfterCall} onNext={(id) => startCall(id)} onDashboard={() => { setRole('manager'); setView('overview') }} onResults={() => { setRole('manager'); setView('results') }} />}
      </main>
    </section>
    {toast && <div className="toast"><Check size={16}/>{toast}</div>}
  </div>
}

function ManagerHome({ accounts, enriched, ready, results, qualified, onContinue, onCompanies }: { accounts: Account[]; enriched: number; ready: number; results: CallResult[]; qualified: number; onContinue: () => void; onCompanies: () => void }) {
  const decisionMakers = results.filter(result => result.decisionMaker).length
  return <>
    <section className="page-heading manager-heading"><div><span className="section-label">Кампания в работе</span><h1>Следующее действие уже понятно</h1><p>Загрузите список компаний, выберите одну из них и покажите полный путь от подготовки до квалифицированного лида.</p></div><button className="button primary hero-action" onClick={onContinue}>Продолжить кампанию <ArrowRight size={17}/></button></section>
    <section className="metric-strip">
      <Metric value={accounts.length} label="Компаний загружено"/>
      <Metric value={enriched} label="Подготовлено досье"/>
      <Metric value={ready} label="Есть контакт"/>
      <Metric value={results.length} label="Звонков сделано"/>
      <Metric value={decisionMakers} label="Найдено ЛПР"/>
      <Metric value={qualified} label="Квалифицировано" highlight/>
    </section>
    <div className="home-layout">
      <section className="next-step-block"><div className="next-step-icon"><Play size={22}/></div><div><span>Рекомендуемое действие</span><h2>{accounts.length ? 'Откройте компанию и добавьте её в очередь' : 'Загрузите список компаний'}</h2><p>{accounts.length ? 'Для демонстрации лучше начать с компании, у которой уже есть краткое досье и понятная причина для контакта.' : 'Подойдут XLS, XLSX или CSV. Предварительно очищать таблицу не нужно.'}</p><button className="button primary" onClick={accounts.length ? onCompanies : onContinue}>{accounts.length ? 'Выбрать компанию' : 'Загрузить Excel'} <ArrowRight size={16}/></button></div></section>
      <section className="today-list"><div className="section-row"><div><span>Сегодня</span><h2>План кампании</h2></div><small>обновляется по ходу демо</small></div><PlanLine icon={Building2} label="Посмотреть компании" value={`${accounts.length} в списке`}/><PlanLine icon={Phone} label="Провести первый звонок" value={results.length ? 'готово' : 'следующий шаг'} done={results.length > 0}/><PlanLine icon={ClipboardCheck} label="Получить разбор" value={results.length ? 'готово' : 'после звонка'} done={results.length > 0}/></section>
    </div>
  </>
}

function Metric({ value, label, highlight = false }: { value: number; label: string; highlight?: boolean }) { return <div className={highlight ? 'highlight' : ''}><strong>{value}</strong><span>{label}</span></div> }
function PlanLine({ icon: Icon, label, value, done = false }: { icon: typeof Phone; label: string; value: string; done?: boolean }) { return <div className="plan-line"><span className={done ? 'done' : ''}>{done ? <Check size={16}/> : <Icon size={16}/>}</span><strong>{label}</strong><small>{value}</small></div> }

function CompaniesView({ accounts, importNote, onOpen, onImport }: { accounts: Account[]; importNote: string; onOpen: (id: string) => void; onImport: () => void }) {
  return <><section className="page-heading compact"><div><span className="section-label">База компаний</span><h1>Кого будем прорабатывать</h1><p>Откройте компанию, чтобы увидеть досье и подготовить следующий звонок.</p></div><button className="button primary" onClick={onImport}><Upload size={16}/> Загрузить Excel</button></section>{importNote && <div className="import-success"><FileSpreadsheet size={17}/><span><strong>Файл обработан</strong>{importNote}</span></div>}<section className="company-list"><div className="company-list-head"><span>Компания</span><span>Размер</span><span>Контакт</span><span>Следующий шаг</span><span/></div>{accounts.map(account => <button className="company-row" key={account.id} onClick={() => onOpen(account.id)}><span className="company-name"><i>{account.name.slice(0, 2).toUpperCase()}</i><span><strong>{account.name}</strong><small>{account.bin ? `БИН ${account.bin}` : account.industry}</small></span></span><span><strong>{account.employeeRange ?? account.employeeCount ?? 'Не указан'}</strong><small>{account.city ?? account.region}</small></span><span><b className={account.contacts.length ? 'status ready' : 'status waiting'}>{account.contacts.length ? 'Найден' : 'Нужно найти'}</b><small>{account.contacts[0]?.value ?? 'В Excel контакта нет'}</small></span><span><strong>{account.contacts.length ? 'Подготовить звонок' : 'Провести демо-звонок'}</strong><small>{account.aiSummary ? 'Досье готово' : 'Нужно изучить'}</small></span><ChevronRight size={17}/></button>)}</section></>
}

function CompanyView({ account, queued, onBack, onQueue, onCall }: { account: Account; queued: boolean; onBack: () => void; onQueue: () => void; onCall: () => void }) {
  const fit = [account.employeeRange ? `Масштаб ${account.employeeRange}` : '', account.city ? `Регион: ${account.city}` : '', account.industry ? `Отрасль: ${account.industry}` : ''].filter(Boolean)
  return <><button className="back-button" onClick={onBack}><ArrowLeft size={16}/> Все компании</button><section className="company-hero"><div className="company-monogram">{account.name.slice(0, 2).toUpperCase()}</div><div><span>{account.industry || 'Отрасль не указана'}</span><h1>{account.name}</h1><p>{account.bin ? `БИН ${account.bin}` : 'БИН не указан'} · {account.city ?? account.region}</p></div><div className="company-actions"><button className="button secondary" onClick={onQueue}>{queued ? <Check size={16}/> : <ListChecks size={16}/>} {queued ? 'В очереди' : 'Добавить в очередь'}</button><button className="button primary" onClick={onCall}><Phone size={16}/> Начать демо-звонок</button></div></section><div className="company-detail-layout"><section className="company-main"><article className="ai-brief"><div><Sparkles size={18}/><span>AI-досье</span><small>на основе загруженных данных</small></div><p>{account.aiSummary ?? 'Данных пока недостаточно. Уточните деятельность, размер и регион компании.'}</p></article><article className="detail-section"><h2>Почему компания подходит</h2><div className="fit-list">{fit.map(item => <span key={item}><Check size={15}/>{item}</span>)}</div></article><article className="detail-section"><h2>Что пока неизвестно</h2><div className="unknown-list">{(account.unknowns ?? ['Актуальная потребность', 'Ответственный за закупку']).map(item => <span key={item}><CircleAlert size={15}/>{item}</span>)}</div></article></section><aside className="company-facts"><h2>Основные данные</h2><Fact label="БИН" value={account.bin}/><Fact label="ОКЭД" value={account.oked}/><Fact label="Размер" value={account.employeeRange ?? (account.employeeCount ? `${account.employeeCount} сотрудников` : '')}/><Fact label="Город и регион" value={account.city ?? account.region}/><Fact label="Руководитель" value={account.leaderName}/><Fact label="Юридический адрес" value={account.address}/><div className="contact-box"><span>Найденные контакты</span>{account.contacts.length ? account.contacts.map(contact => <strong key={contact.id}>{contact.value}</strong>) : <><strong>Контактов в файле нет</strong><small>В демо реальный звонок не выполняется</small></>}</div></aside></div></>
}
function Fact({ label, value }: { label: string; value?: string }) { return <div className="fact"><span>{label}</span><strong>{value || 'Не указано'}</strong></div> }

function CampaignView({ campaign, accounts, onChange, onImport }: { campaign: Campaign; accounts: Account[]; onChange: (campaign: Campaign) => void; onImport: () => void }) {
  return <><section className="page-heading compact"><div><span className="section-label">Настройки кампании</span><h1>Что и кому мы предлагаем</h1><p>Только информация, которая помогает оператору провести разговор.</p></div><button className="button secondary" onClick={onImport}><Upload size={16}/> Заменить список</button></section><div className="campaign-simple"><section className="campaign-form"><label>Название кампании<input value={campaign.name} onChange={event => onChange({ ...campaign, name: event.target.value })}/></label><label>Что продаём<textarea value={campaign.offer} onChange={event => onChange({ ...campaign, offer: event.target.value })}/></label><label>Кому продаём<textarea value={campaign.icp} onChange={event => onChange({ ...campaign, icp: event.target.value })}/></label></section><aside className="campaign-summary"><span>Список компаний</span><strong>{accounts.length}</strong><p>компаний загружено в текущую демонстрационную кампанию</p><button className="button primary" onClick={onImport}>Загрузить другой Excel</button></aside></div></>
}

function ResultsView({ results, accounts, onContinue }: { results: CallResult[]; accounts: Account[]; onContinue: () => void }) {
  const qualified = results.filter(result => result.decisionMaker && result.activeNeed && result.agreedNextStep).length
  return <><section className="page-heading compact"><div><span className="section-label">Итоги кампании</span><h1>Что дали проведённые звонки</h1><p>Только понятные результаты, которые можно передать менеджеру.</p></div><button className="button primary" onClick={onContinue}>Продолжить звонки <ArrowRight size={16}/></button></section><section className="result-summary"><Metric value={results.length} label="Звонков"/><Metric value={results.filter(item => item.decisionMaker).length} label="Найдено ЛПР"/><Metric value={qualified} label="Квалифицировано" highlight/></section>{results.length ? <section className="result-list">{results.map(result => { const account = accounts.find(item => item.id === result.accountId); return <article key={result.accountId}><span className="quality-score">{result.quality}</span><div><strong>{account?.name ?? 'Компания'}</strong><small>{result.outcome} · {new Date(result.completedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</small></div><div className="result-evidence"><span className={result.decisionMaker ? 'yes' : ''}>ЛПР</span><span className={result.activeNeed ? 'yes' : ''}>Потребность</span><span className={result.agreedNextStep ? 'yes' : ''}>Следующий шаг</span></div><strong>{money(result.payout)}</strong></article>})}</section> : <EmptyState icon={ClipboardCheck} title="Здесь появятся результаты" text="Проведите первый демонстрационный звонок — оценка и следующий шаг сохранятся здесь." action="Перейти к звонкам" onAction={onContinue}/>}</>
}

function Onboarding({ step, campaign, importing, error, onStep, onCampaign, onImport, onExample, onClose }: { step: number; campaign: Campaign; importing: boolean; error: string; onStep: (step: number) => void; onCampaign: (campaign: Campaign) => void; onImport: (event: ChangeEvent<HTMLInputElement>) => void; onExample: () => void; onClose: () => void }) {
  return <section className="onboarding"><div className="onboarding-top"><button className="back-button" onClick={step === 1 ? onClose : () => onStep(step - 1)}><ArrowLeft size={16}/>{step === 1 ? 'Вернуться на главную' : 'Назад'}</button><div className="stepper"><span className={step >= 1 ? 'active' : ''}/><span className={step >= 2 ? 'active' : ''}/><span className={step >= 3 ? 'active' : ''}/></div><button className="icon-button" onClick={onClose} aria-label="Закрыть"><X size={18}/></button></div><div className="onboarding-body"><span>Шаг {step} из 3</span>{step === 1 && <><h1>Что вы продаёте?</h1><p>Одного понятного предложения достаточно. Оно появится в подготовке оператора.</p><textarea autoFocus value={campaign.offer} onChange={event => onCampaign({ ...campaign, offer: event.target.value })}/><button className="button primary onboarding-next" disabled={!campaign.offer.trim()} onClick={() => onStep(2)}>Продолжить <ArrowRight size={17}/></button></>}{step === 2 && <><h1>Какие компании вам нужны?</h1><p>Опишите размер, отрасль или географию — обычным языком.</p><textarea autoFocus value={campaign.icp} onChange={event => onCampaign({ ...campaign, icp: event.target.value })}/><button className="button primary onboarding-next" disabled={!campaign.icp.trim()} onClick={() => onStep(3)}>Перейти к загрузке <ArrowRight size={17}/></button></>}{step === 3 && <><h1>Загрузите список компаний</h1><p>ZVONA сама найдёт строку с заголовками. Поддерживаются XLS, XLSX и CSV.</p><label className={`upload-zone ${importing ? 'loading' : ''}`}><FileSpreadsheet size={30}/><strong>{importing ? 'Читаем таблицу…' : 'Перетащите файл или нажмите для выбора'}</strong><span>Файл обрабатывается только в этой вкладке</span><input type="file" accept=".xls,.xlsx,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" onChange={onImport}/></label>{error && <div className="import-error"><CircleAlert size={16}/>{error}</div>}<div className="or"><span>или</span></div><button className="button secondary example-button" onClick={onExample}>Открыть готовый пример <ArrowRight size={16}/></button></>}</div></section>
}

function ShiftView({ queue, results, earnings, onStart, onQueue }: { queue: Account[]; results: CallResult[]; earnings: number; onStart: () => void; onQueue: () => void }) {
  const next = queue[0]
  return <><section className="page-heading operator-heading"><div><span className="section-label">Смена оператора</span><h1>{next ? 'Следующая компания подготовлена' : 'Очередь на сегодня завершена'}</h1><p>{next ? 'Досье, цель разговора и подсказки уже собраны. Вам остаётся провести разговор и зафиксировать результат.' : 'Можно вернуться к руководителю и добавить новые компании.'}</p></div>{next && <button className="button primary hero-action" onClick={onStart}><Headphones size={17}/> Начать звонок</button>}</section><section className="shift-stats"><Metric value={queue.length} label="Осталось звонков"/><Metric value={results.length} label="Завершено"/><div><strong>{money(earnings)}</strong><span>Начислено за смену</span></div></section>{next ? <section className="next-call"><div className="company-monogram">{next.name.slice(0, 2).toUpperCase()}</div><div><span>Следующий звонок</span><h2>{next.name}</h2><p>{next.aiSummary}</p><small>{next.contacts[0]?.value ?? 'Демонстрационный звонок · связь не устанавливается'}</small></div><button className="button secondary" onClick={onQueue}>Открыть очередь <ChevronRight size={16}/></button></section> : <EmptyState icon={Check} title="Смена завершена" text="Все компании из очереди обработаны." action="Посмотреть очередь" onAction={onQueue}/>}</>
}

function CallQueue({ accounts, allAccounts, onStart, onOpen }: { accounts: Account[]; allAccounts: Account[]; onStart: (id: string) => void; onOpen: (id: string) => void }) {
  return <><section className="page-heading compact"><div><span className="section-label">Мои звонки</span><h1>Очередь на сегодня</h1><p>Сверху — компания, с которой лучше начать прямо сейчас.</p></div></section>{accounts.length ? <section className="operator-queue">{accounts.map((account, index) => <article key={account.id} className={index === 0 ? 'next' : ''}><span className="queue-number">{index + 1}</span><div className="company-monogram small">{account.name.slice(0, 2).toUpperCase()}</div><div><strong>{account.name}</strong><small>{account.city ?? account.region} · {account.employeeRange ?? 'Размер не указан'}</small></div><div className="queue-why"><span>Почему звоним</span><p>{account.triggers[0] ?? 'Подходит по масштабу и географии кампании'}</p></div><button className="button primary" onClick={() => onStart(account.id)}>{index === 0 ? 'Начать' : 'Открыть'} <ArrowRight size={15}/></button></article>)}</section> : <EmptyState icon={Phone} title="Очередь пока пуста" text="Вернитесь к списку компаний и добавьте компанию для демонстрационного звонка." action="Выбрать компанию" onAction={() => allAccounts[0] && onOpen(allAccounts[0].id)}/>}</>
}

function EarningsView({ results, accounts, total }: { results: CallResult[]; accounts: Account[]; total: number }) {
  return <><section className="page-heading compact"><div><span className="section-label">Заработок оператора</span><h1>{money(total)}</h1><p>Демонстрационный расчёт зависит от качества разговора, а не от согласия клиента купить.</p></div></section><section className="earning-info"><div><span>Базовая ставка</span><strong>900 ₸</strong></div><div><span>Хорошее качество</span><strong>1 350 ₸</strong></div><div><span>Отличное качество</span><strong>1 750 ₸</strong></div></section>{results.length > 0 && <section className="earning-list">{results.map(result => <div key={result.accountId}><span><strong>{accounts.find(account => account.id === result.accountId)?.name}</strong><small>Оценка звонка: {result.quality}/100</small></span><strong>{money(result.payout)}</strong></div>)}</section>}</>
}

function OperatorCall({ account, onBack, onComplete }: { account: Account; onBack: () => void; onComplete: (result: Omit<CallResult, 'accountId' | 'quality' | 'payout' | 'completedAt'>) => void }) {
  const [outcome, setOutcome] = useState('Интерес есть')
  const [notes, setNotes] = useState('')
  const [decisionMaker, setDecisionMaker] = useState(true)
  const [activeNeed, setActiveNeed] = useState(true)
  const [agreedNextStep, setAgreedNextStep] = useState(true)
  const contact = account.contacts[0]
  const transcript = useMemo(() => [
    ['Оператор', `Здравствуйте! Подскажите, кто у вас отвечает за корпоративные подарки для сотрудников и партнёров?`],
    ['Клиент', 'Этим занимаюсь я вместе с отделом закупок. Что вы предлагаете?'],
    ['Оператор', 'Подбираем и доставляем брендированные наборы по Казахстану под согласованный бюджет и сроки.'],
    ['Клиент', 'Пришлите примеры. Нам может понадобиться около 300 наборов к ноябрю.'],
  ], [])
  return <><button className="back-button" onClick={onBack}><ArrowLeft size={16}/> Вернуться в очередь</button><section className="call-header"><div><span className="live-indicator"><i/> Демонстрационный звонок</span><h1>{account.name}</h1><p>{contact?.value ?? 'Контакт ещё не найден · реальная связь не устанавливается'}</p></div><div className="call-timer"><Phone size={16}/><strong>02:34</strong></div></section><div className="operator-layout"><section className="call-main"><article className="call-company"><div className="company-monogram small">{account.name.slice(0, 2).toUpperCase()}</div><div><span>Краткое AI-досье</span><p>{account.aiSummary}</p></div></article><article className="conversation-goal"><span>Цель разговора</span><strong>Найти ответственного, подтвердить потребность и договориться о следующем шаге</strong></article><article className="say-now"><span><Sparkles size={16}/> Скажите сейчас</span><p>«Подскажите, какой объём наборов вы рассматриваете и к какой дате они должны быть готовы?»</p></article><article className="transcript"><div className="section-row"><div><span>Разговор</span><h2>Демонстрационный транскрипт</h2></div><small>появляется по ходу звонка</small></div>{transcript.map(([speaker, text], index) => <div className={`transcript-line ${speaker === 'Оператор' ? 'operator' : ''}`} key={index}><span>{speaker}</span><p>{text}</p></div>)}</article></section><aside className="call-assistant"><section><h2>Обязательные вопросы</h2>{['Как сейчас решаете эту задачу?', 'Кто участвует в выборе?', 'Какой срок и ориентир бюджета?'].map((question, index) => <label className="call-check" key={question}><input type="checkbox" defaultChecked={index < 2}/><span>{question}</span></label>)}</section><section className="objection"><span>Типовое возражение</span><strong>«У нас уже есть поставщик»</strong><p>Разрешённый ответ: «Понимаю. Можно уточнить, что для вас важнее всего при выборе — срок, состав или бюджет?»</p></section><section className="call-result"><h2>Результат разговора</h2><label>Итог<select value={outcome} onChange={event => setOutcome(event.target.value)}><option>Интерес есть</option><option>Перезвонить позже</option><option>Неверный контакт</option><option>Неактуально</option></select></label><label className="evidence-check"><input type="checkbox" checked={decisionMaker} onChange={event => setDecisionMaker(event.target.checked)}/> Найден ответственный</label><label className="evidence-check"><input type="checkbox" checked={activeNeed} onChange={event => setActiveNeed(event.target.checked)}/> Есть актуальная потребность</label><label className="evidence-check"><input type="checkbox" checked={agreedNextStep} onChange={event => setAgreedNextStep(event.target.checked)}/> Согласован следующий шаг</label><label>Заметки<textarea value={notes} onChange={event => setNotes(event.target.value)} placeholder="Что важно передать менеджеру"/></label><button className="button primary wide" onClick={() => onComplete({ outcome, notes, decisionMaker, activeNeed, agreedNextStep })}>Завершить и получить разбор <ArrowRight size={16}/></button></section></aside></div></>
}

function QaView({ result, account, next, onNext, onDashboard, onResults }: { result: CallResult; account: Account; next?: Account; onNext: (id: string) => void; onDashboard: () => void; onResults: () => void }) {
  const learned = [result.decisionMaker ? 'Подтверждён ответственный за решение' : '', result.activeNeed ? 'Есть актуальная потребность' : '', result.agreedNextStep ? 'Согласован следующий шаг' : ''].filter(Boolean)
  const missed = [!result.decisionMaker ? 'Не найден ответственный' : '', !result.activeNeed ? 'Не подтверждена потребность' : '', !result.agreedNextStep ? 'Нет договорённости о следующем шаге' : ''].filter(Boolean)
  return <><section className="qa-hero"><div><span>Разбор готов</span><h1>{account.name}</h1><p>Звонок завершён, результат добавлен в показатели кампании.</p></div><div className="qa-grade"><strong>{result.quality}</strong><span>из 100</span></div></section><div className="qa-simple-grid"><section><h2>Что удалось выяснить</h2>{learned.map(item => <div className="qa-point good" key={item}><Check size={16}/>{item}</div>)}</section><section><h2>Что сделано хорошо</h2><div className="qa-point good"><Check size={16}/>Разговор начат с понятной цели</div><div className="qa-point good"><Check size={16}/>Зафиксирован конкретный результат</div><div className="qa-point good"><Check size={16}/>Не использованы запрещённые обещания</div></section><section><h2>Что можно улучшить</h2>{missed.length ? missed.map(item => <div className="qa-point warn" key={item}><CircleAlert size={16}/>{item}</div>) : <div className="qa-point good"><Check size={16}/>Все обязательные результаты зафиксированы</div>}<div className="qa-point warn"><CircleAlert size={16}/>Уточнить, кто финально утверждает бюджет</div></section></div><section className="qa-next"><div><span>Следующий шаг</span><h2>{result.decisionMaker && result.activeNeed && result.agreedNextStep ? 'Передать лид менеджеру и отправить примеры наборов' : 'Уточнить недостающие данные'}</h2><p>Начисление оператору за качество разговора: <strong>{money(result.payout)}</strong></p></div><div>{next && <button className="button secondary" onClick={() => onNext(next.id)}>Следующая компания <ArrowRight size={16}/></button>}<button className="button secondary" onClick={onResults}>Открыть результаты</button><button className="button primary" onClick={onDashboard}>Вернуться на главную</button></div></section></>
}

function EmptyState({ icon: Icon, title, text, action, onAction }: { icon: typeof Phone; title: string; text: string; action: string; onAction: () => void }) { return <section className="empty-state"><span><Icon size={24}/></span><h2>{title}</h2><p>{text}</p><button className="button primary" onClick={onAction}>{action} <ArrowRight size={16}/></button></section> }
