"use client"

import { useRef, type ReactNode } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  as?: "div" | "section"
}

export default function Reveal({ children, className, delay = 0, as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger)
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: delay / 1000,
        ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 85%", toggleActions: "play none none reverse" },
      }
    )
  }, { scope: ref })

  return <Tag ref={ref} className={className}>{children}</Tag>
}
