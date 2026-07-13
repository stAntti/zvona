import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'
import { importAccountsFile } from './excel-import'

function makeWorkbookFile(extension: 'xls' | 'xlsx') {
  const workbook = XLSX.utils.book_new()
  const sheet = XLSX.utils.aoa_to_sheet([
    ['.'],
    ['БИН', 'Полное наименование', 'Наименование основного вида деятельности', 'Наименование КРП', 'Наименование населенного пункта', 'ФИО руководителя'],
    ['001234567890', 'ТОО «Демо Компания»', 'Складская логистика', 'Средние предприятия (151-200)', 'Алматы', 'Айжан Демо'],
  ])
  XLSX.utils.book_append_sheet(workbook, sheet, 'Лист1')
  const bytes = XLSX.write(workbook, { type: 'array', bookType: extension === 'xls' ? 'biff8' : 'xlsx' })
  return new File([bytes], `companies.${extension}`)
}

describe('Excel import for the demo flow', () => {
  it.each(['xlsx', 'xls'] as const)('imports .%s and keeps BIN as a string', async extension => {
    const result = await importAccountsFile(makeWorkbookFile(extension))

    expect(result.headerRow).toBe(2)
    expect(result.accounts).toHaveLength(1)
    expect(result.accounts[0]).toMatchObject({
      bin: '001234567890',
      name: 'ТОО «Демо Компания»',
      city: 'Алматы',
      leaderName: 'Айжан Демо',
    })
  })
})
