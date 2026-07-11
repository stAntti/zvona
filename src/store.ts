import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CallResult, Role } from './domain'

interface AppState {
  role: Role
  callStep: number
  callRunning: boolean
  elapsed: number
  completedQuestions: string[]
  preparationChecks: string[]
  completedDemo: boolean
  callResult: CallResult | null
  disputed: boolean
  disputeComment: string
  onboardingCompleted: string[]
  setRole: (role: Role) => void
  setCallStep: (step: number) => void
  toggleCall: () => void
  setElapsed: (elapsed: number) => void
  startCall: () => void
  resetCall: () => void
  completeQuestion: (id: string) => void
  togglePreparation: (id: string) => void
  finishCall: (result: CallResult) => void
  submitDispute: (comment: string) => void
  completeOnboardingStep: (id: string) => void
  resetDemo: () => void
}

const initialState = {
  role: 'operator' as Role,
  callStep: 0,
  callRunning: false,
  elapsed: 0,
  completedQuestions: [] as string[],
  preparationChecks: [] as string[],
  completedDemo: false,
  callResult: null as CallResult | null,
  disputed: false,
  disputeComment: '',
  onboardingCompleted: [] as string[],
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      setRole: (role) => set({ role }),
      setCallStep: (callStep) => set({ callStep }),
      toggleCall: () => set((state) => ({ callRunning: !state.callRunning })),
      setElapsed: (elapsed) => set({ elapsed }),
      startCall: () => set({ callStep: 0, callRunning: true, elapsed: 0, completedQuestions: [] }),
      resetCall: () => set({ callStep: 0, callRunning: false, elapsed: 0, completedQuestions: [] }),
      completeQuestion: (id) => set((state) => ({ completedQuestions: state.completedQuestions.includes(id) ? state.completedQuestions : [...state.completedQuestions, id] })),
      togglePreparation: (id) => set((state) => ({ preparationChecks: state.preparationChecks.includes(id) ? state.preparationChecks.filter((item) => item !== id) : [...state.preparationChecks, id] })),
      finishCall: (callResult) => set({ callResult, completedDemo: true, callRunning: false }),
      submitDispute: (disputeComment) => set({ disputed: true, disputeComment }),
      completeOnboardingStep: (id) => set((state) => ({ onboardingCompleted: state.onboardingCompleted.includes(id) ? state.onboardingCompleted : [...state.onboardingCompleted, id] })),
      resetDemo: () => set(initialState),
    }),
    { name: 'zvona-demo' },
  ),
)
