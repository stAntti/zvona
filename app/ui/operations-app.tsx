'use client'

import { useMemo, useState, type ChangeEvent } from 'react'
import { ArrowRight, Building2, Check, ChevronRight, CircleAlert, Database, Download, FileUp, Gauge, Mail, MessageCircle, Phone, Search, ShieldCheck, Sparkles, Target, Users } from 'lucide-react'
import { calculateAccountReadiness, calculateCampaignReadiness, createTaskCard, recommendNextAction, routeAccount, toCrmCsv, type Account, type Campaign, type Channel } from '@/lib/domain'
import { demoAccounts, demoCampaign } from '@/lib/fixtures'

type View = 'overview' | 'campaign' | 'accounts' | 'queue' | 'task' | 'qa'

const nav: Array<{ id: View; label: string; icon: typeof Target }> = [
  { id: 'overview', label: 'Командный центр', icon: Gauge },
  { id: 'campaign', label: 'Readiness кампании', icon: Target },
  { id: 'accounts', label: 'Аккаунты и research', icon: Building2 },
  { id: 'queue', label: 'Очередь действий', icon: Users },
  { id: 'task', label: 'Task card', icon: Phone },
  { id: 'qa', label: 'QA и outcomes', icon: ShieldCheck },
]

const channelLabels: Record<Channel, string> = {
  manual_call: 'Ручной звонок', email_draft: 'Email-черновик', whatsapp_draft: 'WhatsApp-черновик', manual_research: 'Research', manual_review: 'Ручная проверка',
}

export function OperationsApp() {
  const [view, setView] = useState<View>('overview')
  const [campaign, setCampaign] = useState<Campaign>(demoCampaign)
  const [accounts, setAccounts] = useState<Account[]>(demoAccounts)
  const [activeId, setActiveId] = useState('astra')
  const [toast, setToast] = useState('')
  const campaignReadiness = calculateCampaignReadiness(campaign)
  const routes = useMemo(() => accounts.map((account) => ({ account, route: routeAccount(campaign, account), readiness: calculateAccountReadiness(account) })), [accounts, campaign])
  const active = accounts.find((account) => account.id === activeId) ?? accounts[0]
  const activeRoute = routeAccount(campaign, active)
  const task = createTaskCard(campaign, active, activeRoute)
  const readyCount = routes.filter((row) => row.readiness.band === 'ready').length

  const flash = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2500) }
  const downloadCsv = () => {
    const blob = new Blob([toCrmCsv(routes.map(({ account, route }) => ({ account, route, outcome: account.id === 'astra' ? 'qualified' : '', nextAction: account.id === 'astra' ? 'route_to_ae' : 'nurture' })))], { type: 'text/csv;charset=utf-8' })
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'zvona-crm-writeback.csv'; link.click(); URL.revokeObjectURL(link.href)
  }
  const importCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return
    const text = await file.text(); const lines = text.split(/\r?\n/).filter(Boolean); if (lines.length < 2) return flash('В CSV нет строк для импорта')
    const headers = lines[0].split(',').map((item) => item.trim().toLowerCase())
    const get = (values: string[], name: string) => values[headers.indexOf(name)]?.trim() ?? ''
    const created = lines.slice(1).map((line, index): Account => {
      const values = line.split(',')
      return { id: `import-${Date.now()}-${index}`, organizationId: 'org-zvona', externalId: get(values, 'external_id') || `CSV-${index + 1}`, name: get(values, 'name') || `Компания ${index + 1}`, domain: get(values, 'domain'), industry: get(values, 'industry'), employeeCount: Number(get(values, 'employees')) || undefined, region: get(values, 'region') || 'Не указан', language: get(values, 'language') || 'ru', icpFit: true, triggers: [], persona: get(values, 'persona') || 'Требует research', personaConfidence: .35, potential: Number(get(values, 'potential')) || 0, contacts: [] }
    })
    setAccounts((current) => [...current, ...created]); flash(`Импортировано: ${created.length}`); setView('accounts')
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <button className="brand" onClick={() => setView('overview')}><span>Z</span><strong>ZVONA<small>outreach operations</small></strong></button>
      <div className="workspace"><i /><div><span>Design partner</span><strong>Northstar Gifts KZ</strong></div></div>
      <nav aria-label="Основная навигация">{nav.map((item) => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => setView(item.id)}><item.icon size={18}/>{item.label}</button>)}</nav>
      <div className="sidebar-foot"><Database size={16}/><span>Tenant: org-zvona<small>demo data · isolated</small></span></div>
    </aside>
    <section className="workspace-main">
      <header className="topbar"><div><span className="crumb">Кампания / {nav.find((item) => item.id === view)?.label}</span><strong>{campaign.name}</strong></div><div className="top-actions"><span className={`readiness-badge ${campaignReadiness.band}`}><i /> Readiness {campaignReadiness.score}</span><button className="button secondary" onClick={downloadCsv}><Download size={16}/> CRM CSV</button></div></header>
      <main id="main" className="content">
        {view === 'overview' && <Overview campaign={campaign} routes={routes} onNavigate={setView} />}
        {view === 'campaign' && <CampaignEditor campaign={campaign} setCampaign={setCampaign} />}
        {view === 'accounts' && <AccountsView rows={routes} activeId={activeId} onSelect={(id) => { setActiveId(id); setView('task') }} importCsv={importCsv} />}
        {view === 'queue' && <QueueView rows={routes} onSelect={(id) => { setActiveId(id); setView('task') }} />}
        {view === 'task' && <TaskView task={task} account={active} onComplete={() => { flash('Outcome сохранён, создано действие route_to_ae'); setView('qa') }} />}
        {view === 'qa' && <QaView account={active} />}
      </main>
    </section>
    {toast && <div className="toast"><Check size={16}/>{toast}</div>}
  </div>
}

function Overview({ campaign, routes, onNavigate }: { campaign: Campaign; routes: ReturnType<typeof rowsShape>; onNavigate: (view: View) => void }) {
  const ready = routes.filter((row) => row.readiness.band === 'ready').length
  return <>
    <section className="page-heading"><div><span className="section-kicker">Operations overview</span><h1>От списка компаний до следующего действия</h1><p>Research, правила маршрутизации и контроль качества собраны в одном рабочем потоке.</p></div><button className="button primary" onClick={() => onNavigate('queue')}>Открыть очередь <ArrowRight size={17}/></button></section>
    <section className="flow-strip"><FlowStep value={routes.length} label="Импортировано"/><FlowStep value={routes.length - 1} label="Исследовано"/><FlowStep value={ready} label="Готово"/><FlowStep value={1} label="SQL подтверждён"/><FlowStep value="18 400 ₸" label="Стоимость outcome"/></section>
    <div className="overview-grid">
      <section className="panel action-plan"><div className="panel-heading"><div><h2>Действия на сегодня</h2><p>Routing engine сформировал очередь по readiness и потенциалу.</p></div><span>12 июля</span></div>
        <Action icon={Phone} count="18" label="ручных звонков" detail="6 для senior operator"/>
        <Action icon={Mail} count="31" label="email-черновик" detail="требуют подтверждения"/>
        <Action icon={MessageCircle} count="9" label="WhatsApp-черновиков" detail="без автоматической отправки"/>
        <Action icon={Search} count="14" label="задач research" detail="не хватает данных"/>
      </section>
      <section className="panel readiness-panel"><div className="panel-heading"><div><h2>Campaign readiness</h2><p>Execution разрешён, но два правила требуют внимания.</p></div><Gauge size={22}/></div><div className="score-row"><strong>{calculateCampaignReadiness(campaign).score}</strong><div><span>из 100</span><div className="meter"><i style={{ width: `${calculateCampaignReadiness(campaign).score}%` }}/></div></div></div>{calculateCampaignReadiness(campaign).factors.slice(-4).map((factor) => <div className="check-row" key={factor.label}><span className={factor.passed ? 'pass' : 'fail'}>{factor.passed ? <Check size={14}/> : <CircleAlert size={14}/>}</span><span>{factor.label}</span><strong>+{factor.points}</strong></div>)}<button className="text-button" onClick={() => onNavigate('campaign')}>Открыть правила <ChevronRight size={15}/></button></section>
    </div>
  </>
}

function rowsShape() { return [] as Array<{ account: Account; route: ReturnType<typeof routeAccount>; readiness: ReturnType<typeof calculateAccountReadiness> }> }
function FlowStep({ value, label }: { value: string | number; label: string }) { return <div><strong>{value}</strong><span>{label}</span></div> }
function Action({ icon: Icon, count, label, detail }: { icon: typeof Phone; count: string; label: string; detail: string }) { return <div className="action-line"><span className="action-icon"><Icon size={18}/></span><strong>{count}</strong><div><span>{label}</span><small>{detail}</small></div><ChevronRight size={17}/></div> }

function CampaignEditor({ campaign, setCampaign }: { campaign: Campaign; setCampaign: (value: Campaign) => void }) {
  const score = calculateCampaignReadiness(campaign)
  const field = (key: keyof Campaign, value: string) => setCampaign({ ...campaign, [key]: value })
  return <><section className="page-heading compact"><div><span className="section-kicker">Readiness gate</span><h1>Правила кампании</h1><p>Execution блокируется, если offer, claims или qualification criteria не готовы.</p></div><div className={`score-tile ${score.band}`}><strong>{score.score}</strong><span>{score.band}</span></div></section><div className="editor-layout"><form className="panel form-panel" onSubmit={(event) => event.preventDefault()}><label>Название кампании<input value={campaign.name} onChange={(e) => field('name', e.target.value)}/></label><label>Offer<textarea value={campaign.offer} onChange={(e) => field('offer', e.target.value)}/></label><label>ICP<textarea value={campaign.icp} onChange={(e) => field('icp', e.target.value)}/></label><label>Qualification definition<textarea value={campaign.qualificationDefinition} onChange={(e) => field('qualificationDefinition', e.target.value)}/></label><button className="button primary" type="button">Сохранено локально <Check size={16}/></button></form><section className="panel checklist"><h2>Проверка запуска</h2>{score.factors.map((factor) => <div className="check-row" key={factor.label}><span className={factor.passed ? 'pass' : 'fail'}>{factor.passed ? <Check size={14}/> : <CircleAlert size={14}/>}</span><span>{factor.label}</span><strong>{factor.points}</strong></div>)}</section></div></>
}

function AccountsView({ rows, activeId, onSelect, importCsv }: { rows: ReturnType<typeof rowsShape>; activeId: string; onSelect: (id: string) => void; importCsv: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return <><section className="page-heading compact"><div><span className="section-kicker">Research workspace</span><h1>Аккаунты и источники</h1><p>Факты, гипотезы и контактные данные сохраняют provenance.</p></div><label className="button primary file-button"><FileUp size={16}/> Импорт CSV<input type="file" accept=".csv,text/csv" onChange={importCsv}/></label></section><section className="panel table-panel"><div className="table-head"><span>Аккаунт</span><span>Readiness</span><span>Контакт</span><span>Routing</span><span/></div>{rows.map(({ account, readiness, route }) => <button className={`table-row ${activeId === account.id ? 'selected' : ''}`} key={account.id} onClick={() => onSelect(account.id)}><span><strong>{account.name}</strong><small>{account.industry} · {account.region}</small></span><span><b className={`score-dot ${readiness.band}`}>{readiness.score}</b><small>{readiness.band}</small></span><span><strong>{account.contacts[0]?.value ?? 'Не найден'}</strong><small>{account.contacts[0]?.sourceLabel ?? 'Нужен research'}</small></span><span><strong>{channelLabels[route.channel]}</strong><small>{route.ruleId} · {route.executor}</small></span><ChevronRight size={17}/></button>)}</section><p className="import-hint">CSV-поля: external_id, name, domain, industry, employees, region, language, persona, potential.</p></>
}

function QueueView({ rows, onSelect }: { rows: ReturnType<typeof rowsShape>; onSelect: (id: string) => void }) { return <><section className="page-heading compact"><div><span className="section-kicker">Routing engine</span><h1>Очередь исполнимых задач</h1><p>Каждая строка объясняет канал, исполнителя и правило выбора.</p></div></section><section className="queue-list">{rows.map(({ account, readiness, route }, index) => <article className="queue-item" key={account.id}><span className="queue-index">{String(index + 1).padStart(2, '0')}</span><div className="queue-company"><strong>{account.name}</strong><span>{account.persona} · readiness {readiness.score}</span></div><div className="channel-mark"><ChannelIcon channel={route.channel}/><span><strong>{channelLabels[route.channel]}</strong><small>{route.policy}</small></span></div><div className="route-reason"><span>{route.ruleId}</span><p>{route.reason}</p></div><button className="button secondary" onClick={() => onSelect(account.id)}>Открыть <ArrowRight size={15}/></button></article>)}</section></> }
function ChannelIcon({ channel }: { channel: Channel }) { const Icon = channel === 'manual_call' ? Phone : channel === 'email_draft' ? Mail : channel === 'whatsapp_draft' ? MessageCircle : Search; return <span className="channel-icon"><Icon size={18}/></span> }

function TaskView({ task, account, onComplete }: { task: ReturnType<typeof createTaskCard>; account: Account; onComplete: () => void }) {
  const [draft, setDraft] = useState('Здравствуйте! Увидели, что ваша команда расширяется. Подскажите, кто отвечает за корпоративные подарки для сотрудников и партнёров?')
  return <><section className="task-header"><div><span className="section-kicker">Task {task.id} · v{task.version}</span><h1>{account.name}</h1><p>{task.goal}</p></div><div className="task-channel"><ChannelIcon channel={task.channel}/><span><small>Канал</small><strong>{channelLabels[task.channel]}</strong></span></div></section><div className="task-grid"><div className="task-primary"><section className="panel dossier"><h2>Почему этот аккаунт</h2>{task.whyAccount.map((signal) => <div className="signal" key={signal}><Sparkles size={15}/>{signal}</div>)}<div className="persona"><span>Persona hypothesis</span><strong>{task.personaSummary}</strong></div></section><section className="panel"><h2>Обязательные вопросы</h2><ol className="question-list">{task.mandatoryQuestions.map((question) => <li key={question}><span/><p>{question}</p></li>)}</ol></section>{task.channel !== 'manual_call' && <section className="panel draft-panel"><div className="panel-heading"><div><h2>Черновик сообщения</h2><p>Отправка вне ZVONA. Проверьте источник и consent.</p></div><span className="draft-only">draft only</span></div><textarea value={draft} onChange={(e) => setDraft(e.target.value)}/><div className="source-note"><CircleAlert size={15}/> Публичный контакт не означает согласие на WhatsApp-рассылку.</div></section>}</div><aside className="task-guardrails"><section className="guard allowed"><h3><Check size={16}/> Можно обещать</h3>{task.allowedClaims.map((item) => <p key={item}>{item}</p>)}</section><section className="guard forbidden"><h3><CircleAlert size={16}/> Запрещено</h3>{task.forbiddenClaims.map((item) => <p key={item}>{item}</p>)}</section><section className="panel compact-panel"><h3>Вероятные возражения</h3>{task.objections.map((item) => <button key={item}>{item}<ChevronRight size={14}/></button>)}</section><button className="button primary wide" onClick={onComplete}>Завершить и проверить <ArrowRight size={16}/></button></aside></div></>
}

function QaView({ account }: { account: Account }) {
  const evidence = { decisionMaker: true, activeNeed: true, agreedNextStep: true }
  const next = recommendNextAction('qualified', evidence)
  return <><section className="page-heading compact"><div><span className="section-kicker">Post-call review</span><h1>Outcome подтверждён</h1><p>QA сверил task snapshot, logging и демонстрационный transcript.</p></div><span className="valid-stamp"><Check size={20}/> VALID</span></section><div className="qa-layout"><section className="panel qa-score"><span>Quality score</span><strong>92</strong><small>оператор соблюдал правила кампании</small><div className="meter"><i style={{ width: '92%' }}/></div></section><section className="panel evidence-panel"><h2>Qualification evidence</h2><div className="evidence"><Check size={16}/><span><strong>ЛПР найден</strong><small>HR Director подтверждён в разговоре</small></span></div><div className="evidence"><Check size={16}/><span><strong>Потребность актуальна</strong><small>300 наборов до 15 ноября</small></span></div><div className="evidence"><Check size={16}/><span><strong>Следующий шаг согласован</strong><small>Discovery call с закупками</small></span></div></section><section className="panel next-action"><span>Next-best-action</span><h2>{next}</h2><p>{account.name} передаётся account executive вместе с evidence и task snapshot.</p><button className="button primary">Создать задачу AE <ArrowRight size={16}/></button></section></div></>
}
