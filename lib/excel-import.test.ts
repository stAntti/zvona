import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'
import { importAccountsFile } from './excel-import'

function makeWorkbookFile(extension: 'xls' | 'xlsx' | 'csv') {
  const workbook = XLSX.utils.book_new()
  const sheet = XLSX.utils.aoa_to_sheet([
    ['.'],
    ['БИН', 'Полное наименование', 'Наименование основного вида деятельности', 'Наименование КРП', 'Наименование населенного пункта', 'ФИО руководителя', 'Телефон', 'E-Mail'],
    ['001234567890', 'ТОО «Демо Компания»', 'Складская логистика', 'Средние предприятия (151-200)', 'Алматы', 'Айжан Демо', '+7 700 000 00 01', 'hello@demo.example'],
  ])
  XLSX.utils.book_append_sheet(workbook, sheet, 'Лист1')
  const bookType = extension === 'xls' ? 'biff8' : extension
  const bytes = XLSX.write(workbook, { type: 'array', bookType })
  return new File([bytes], `companies.${extension}`)
}

describe('Excel import for the demo flow', () => {
  it.each(['xlsx', 'xls', 'csv'] as const)('imports .%s and keeps BIN as a string', async extension => {
    const result = await importAccountsFile(makeWorkbookFile(extension))

    expect(result.headerRow).toBe(2)
    expect(result.accounts).toHaveLength(1)
    expect(result.accounts[0]).toMatchObject({
      bin: '001234567890',
      name: 'ТОО «Демо Компания»',
      city: 'Алматы',
      leaderName: 'Айжан Демо',
      contacts: expect.arrayContaining([
        expect.objectContaining({ type: 'phone', value: '+7 700 000 00 01' }),
        expect.objectContaining({ type: 'email', value: 'hello@demo.example' }),
      ]),
    })
  })

  it('imports the KazData column names and recognizes phone, email and website', async () => {
    const workbook = XLSX.utils.book_new()
    const sheet = XLSX.utils.aoa_to_sheet([
      ['БИН', 'Наименование', 'ОКЭД', 'Вид деятельности', 'Населённый пункт', 'Размер предприятия', 'Руководитель', 'Юр.Адрес', 'Тел./Факс', 'E-Mail', 'Сайт'],
      ['180540018878', 'ТОО «Демо Строй»', '41201', 'Строительство жилых зданий', 'г. Алматы', 'Крупные предприятия (от 1001 чел.)', 'Иван Демо', 'ул. Демо, 1', 'тел. 245-41-48', 'office@demo.example', 'demo.example'],
    ])
    XLSX.utils.book_append_sheet(workbook, sheet, 'Организации')
    const bytes = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
    const result = await importAccountsFile(new File([bytes], 'kazdata.xlsx'))

    expect(result.accounts[0]).toMatchObject({
      bin: '180540018878',
      name: 'ТОО «Демо Строй»',
      industry: 'Строительство жилых зданий',
      city: 'г. Алматы',
      leaderName: 'Иван Демо',
      domain: 'demo.example',
      contacts: expect.arrayContaining([
        expect.objectContaining({ type: 'phone', value: 'тел. 245-41-48' }),
        expect.objectContaining({ type: 'email', value: 'office@demo.example' }),
      ]),
    })
  })

  it('explains which required columns are missing', async () => {
    const file = new File(['Название,Город\nДемо,Алматы'], 'wrong.csv', { type: 'text/csv' })

    await expect(importAccountsFile(file)).rejects.toThrow('Не найдены колонки «БИН» и «Полное наименование»')
  })
})
