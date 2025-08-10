"use client"

import { motion } from 'framer-motion'
import Balancer from 'react-wrap-balancer'
import { Badge } from '@/components/ui/badge'

export function HeroSection() {
  return (
    <header className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center text-center mb-8">
      <motion.h1
        initial={{ opacity: 0, scale: 0.92, y: -30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className="text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg leading-[1.1] pb-2 overflow-visible"
        style={{
          background: "linear-gradient(90deg,#a5b4fc,#f472b6,#38bdf8,#a5b4fc)",
          backgroundSize: "200% 200%",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          animation: "gradient-move 4s ease-in-out infinite",
        }}
      >
        <Balancer>
          Shared Food Budget
        </Balancer>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7 }}
        className="mt-4 text-lg text-muted-foreground font-medium"
      >
        <Balancer>
          Track, split, and balance your shared food expenses with points and transparency.
        </Balancer>
      </motion.p>
      <Badge
        variant="secondary"
        className="mt-4 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg animate-bounce"
      >
        v0.1 &nbsp;•&nbsp; INR
      </Badge>
    </header>
  )
}