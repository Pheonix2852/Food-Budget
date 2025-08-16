import React from 'react'

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-muted rounded ${className} animate-pulse`} />
}

export default Skeleton
