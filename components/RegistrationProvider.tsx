"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface RegistrationData {
  location: string
  eventDate?: string
  eventTime?: string
  price: number  // per-seat, in paise, from Location_Date Price column
  name: string
  contact: string
  email: string
  aadhar: string
  guests: { name: string; age: string }[]  // additional guests beyond registrant
  about?: string
  social?: string
}

interface RegistrationContextValue {
  data: RegistrationData | null
  setRegistrationData: (data: RegistrationData) => void
  clearRegistrationData: () => void
}

const RegistrationContext = createContext<RegistrationContextValue | null>(null)

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [data, setRegistrationData] = useState<RegistrationData | null>(null)
  const clearRegistrationData = () => setRegistrationData(null)

  return (
    <RegistrationContext.Provider value={{ data, setRegistrationData, clearRegistrationData }}>
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
