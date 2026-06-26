import type { Dispatch, FormEvent, SetStateAction } from "react"

export type LoginType = {
  email: string
  password: string
  loading: boolean
  error: string | null
  info: string | null
  setEmail: Dispatch<SetStateAction<string>>
  setPassword: Dispatch<SetStateAction<string>>
  handleDemo: () => void
  handleLogin: (e: FormEvent) => Promise<void>
  handleSignUp: () => Promise<void>
}
