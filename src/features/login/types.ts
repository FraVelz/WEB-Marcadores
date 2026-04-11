import type { Dispatch, SetStateAction } from "react"

export type LoginType = {
  email: string
  password: string
  loading: boolean
  error: string | null
  setEmail: Dispatch<SetStateAction<string>>
  setPassword: Dispatch<SetStateAction<string>>
  handleDemo: () => void
  handleLogin: (e: React.FormEvent) => Promise<void>
  handleSignUp: (e: React.FormEvent) => Promise<void>
}
