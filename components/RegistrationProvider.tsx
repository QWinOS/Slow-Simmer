"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface RegistrationData {
  location: string
  eventDate?: string
  eventTime?: string
  name: string
  contact: string
  email: string
  aadhar: string
  bringingGuest: boolean
  guestName?: string
  guestAge?: string
  about?: string
  social?: string
}

interface RegistrationContextValue {
  data: RegistrationData | null
  setRegistrationData: (data: RegistrationData) => void
}

const RegistrationContext = createContext<RegistrationContextValue | null>(null)

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [data, setRegistrationData] = useState<RegistrationData | null>(null)

  return (
    <RegistrationContext.Provider value={{ data, setRegistrationData }}>
      {children}
    </RegistrationContext.Provider>
  )
}

export function useRegistration() {
  const ctx = useContext(RegistrationContext)
  if (!ctx) throw new Error("useRegistration must be inside RegistrationProvider")
  return ctx
}

export default RegistrationProvider
