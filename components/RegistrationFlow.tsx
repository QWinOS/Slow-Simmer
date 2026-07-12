"use client"

import { useRegistration } from "@/components/RegistrationProvider"
import { RegistrationForm } from "@/components/RegistrationForm"
import { PaymentSection } from "@/components/PaymentSection"

export function RegistrationFlow() {
  const { data } = useRegistration()

  if (data) {
    return <PaymentSection />
  }

  return <RegistrationForm />
}

export default RegistrationFlow
