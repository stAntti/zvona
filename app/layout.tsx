import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ZVONA · Outreach operations',
  description: 'Управляемый B2B outreach от ICP до квалифицированного результата',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body><a className="skip-link" href="#main">К основному содержанию</a>{children}</body></html>
}
