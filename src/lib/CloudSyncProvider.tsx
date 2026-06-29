'use client'

import { useEffect, useRef } from 'react'
import { useStore } from './store'
import { useAuth } from './AuthContext'

export default function CloudSyncProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
