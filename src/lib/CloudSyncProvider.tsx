'use client'

import { useEffect, useRef } from 'react'
import { useStore } from './store'
import { useAuth } from './AuthContext'

export default function CloudSyncProvider({ children }: { children: React.ReactNode }) {
  const { state } = useStore()
  const { user } = useAuth()
  const lastSync = useRef('')
  const loaded = useRef(false)

  useEffect(() => {
    if (!user?.id || loaded.current) return
    loaded.current = true

    fetch('/api/sync-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'load', userId: user.id }),
    }).then(r => r.json()).then(data => {
      if (data?.store) {
        const local = localStorage.getItem('financas-facil-data')
        const localData = local ? JSON.parse(local) : null
        if (!localData?.transactions?.length) {
          localStorage.setItem('financas-facil-data', JSON.stringify(data.store))
          window.location.reload()
        }
      }
    })
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    const interval = setInterval(() => {
      const current = localStorage.getItem('financas-facil-data')
      if (current && current !== lastSync.current) {
        lastSync.current = current
        fetch('/api/sync-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'save', userId: user.id, store: JSON.parse(current) }),
        })
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [user?.id])

  return <>{children}</>
}
