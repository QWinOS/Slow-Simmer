"use client"

import dynamic from "next/dynamic"

const RegistrationFlow = dynamic(() => import("@/components/RegistrationFlow"), { ssr: false })

export default function RegistrationFlowLazy() {
  return <RegistrationFlow />
}
