import { OperationsApp } from './ui/operations-app'
import { redirect } from 'next/navigation'
import { getPilotSession } from '@/lib/auth'

export default async function Home() {
  if (!(await getPilotSession())) redirect('/login')
  return <OperationsApp />
}
