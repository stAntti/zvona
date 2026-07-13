import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ZVONA · Управляемые звонки',
  description: 'От списка компаний до квалифицированного лида за один понятный процесс',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body><a className="skip-link" href="#main">К основному содержанию</a>{children}</body></html>
}
