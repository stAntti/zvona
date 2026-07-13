import type { Account } from './domain'

type Cell = string | number | boolean | Date | null | undefined

const clean = (value: Cell) => String(value ?? '').trim()
const key = (value: Cell) => clean(value).toLowerCase().replaceAll('ё', 'е').replace(/\s+/g, ' ')

const headerNames = {
  bin: ['бин'],
  name: ['полное наименование', 'толық атауы'],
  industry: ['наименование основного вида деятельности', 'негізгі қызмет түрінің атауы'],
  oked: ['окэд'],
  size: ['наименование крп', 'ккж атауы'],
  city: ['наименование населенного пункта', 'елді мекеннің атауы'],
  address: ['заңды мекен-жайы, юридический адрес', 'юридический адрес'],
  leader: ['басшының таә, фио руководителя', 'фио руководителя'],
  registered: ['дата регистрации'],
} as const

function findColumn(headers: Cell[], names: readonly string[]) {
  return headers.findIndex(header => names.some(name => key(header) === name || key(header).includes(name)))
}

function getValue(row: Cell[], headers: Cell[], names: readonly string[]) {
  const index = findColumn(headers, names)
  return index >= 0 ? clean(row[index]) : ''
}

function employeeRange(value: string) {
  const match = value.match(/\(([^)]+)\)/)
  return (match?.[1] ?? value).replace(/(крупные предприятия|ірі кәсіпорындар)/gi, '').trim().replace('-', '–') || 'Размер не указан'
}

function makeSummary(name: string, industry: string, size: string, city: string, leader: string) {
  const parts = [
    `${name} — ${industry ? industry.toLowerCase() : 'компания с неуточнённой деятельностью'}.`,
    size && size !== 'Размер не указан' ? `Масштаб: ${size.toLowerCase()}.` : '',
    city ? `Регион: ${city}.` : '',
    leader ? `В реестре указан руководитель ${leader}.` : '',
    'Перед звонком нужно подтвердить контакт, потребность и ответственного за закупку.',
  ]
  return parts.filter(Boolean).join(' ')
}

export interface ExcelImportResult {
  accounts: Account[]
  sheetName: string
  headerRow: number
}

export async function importAccountsFile(file: File): Promise<ExcelImportResult> {
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true })

  for (const sheetName of workbook.SheetNames) {
    const rows = XLSX.utils.sheet_to_json<Cell[]>(workbook.Sheets[sheetName], { header: 1, raw: false, defval: '' })
    const headerIndex = rows.slice(0, 10).findIndex(row => findColumn(row, headerNames.bin) >= 0 && findColumn(row, headerNames.name) >= 0)
    if (headerIndex < 0) continue

    const headers = rows[headerIndex]
    const accounts = rows.slice(headerIndex + 1).map((row, index): Account | null => {
      const bin = getValue(row, headers, headerNames.bin).replace(/\.0$/, '')
      const name = getValue(row, headers, headerNames.name)
      if (!bin && !name) return null
      const industry = getValue(row, headers, headerNames.industry)
      const size = employeeRange(getValue(row, headers, headerNames.size))
      const city = getValue(row, headers, headerNames.city)
      const leaderName = getValue(row, headers, headerNames.leader)
      return {
        id: `excel-${Date.now()}-${index}`,
        organizationId: 'demo-session',
        externalId: bin || `ROW-${index + 1}`,
        bin,
        name: name || `Компания ${index + 1}`,
        domain: '',
        industry,
        oked: getValue(row, headers, headerNames.oked),
        employeeRange: size,
        region: city,
        city,
        address: getValue(row, headers, headerNames.address),
        leaderName,
        registrationDate: getValue(row, headers, headerNames.registered),
        language: 'ru',
        icpFit: /101|151|201|251|501|1000|круп|ірі/i.test(size),
        triggers: [],
        persona: leaderName ? 'Руководитель компании' : 'Ответственный требует уточнения',
        personaConfidence: leaderName ? .55 : .2,
        potential: 0,
        contacts: [],
        aiSummary: makeSummary(name || `Компания ${index + 1}`, industry, size, city, leaderName),
        unknowns: ['Рабочий телефон или email', 'Ответственный за корпоративные закупки', 'Актуальная потребность и бюджет'],
      }
    }).filter((account): account is Account => Boolean(account))

    if (!accounts.length) throw new Error('В таблице нет строк с компаниями')
    return { accounts, sheetName, headerRow: headerIndex + 1 }
  }

  throw new Error('Не найдены колонки «БИН» и «Полное наименование»')
}
