'use client'

import { useEffect, useRef } from 'react'
import { useStore } from './store'
import { useAuth } from './AuthContext'
import { syncToCloud, loadFromCloud } from './cloudSync'

export default function CloudSyncProvider({ children }: { children: React.ReactNode }) {
  const { state } = useStore()
  const { user } = useAuth()
  const lastSync = useRef('')
  const initialLoadDone = useRef(false)

  // Carregar dados da nuvem no primeiro login
  useEffect(() => {
    if (!user?.id || initialLoadDone.current) return
    initialLoadDone.current = true

    loadFromCloud(user.id, 'store').then(cloudData => {
      if (cloudData && Object.keys(cloudData).length > 0) {
        const localData = localStorage.getItem('financas-facil-data')
        const local = localData ? JSON.parse(localData) : null

        // Só carrega da nuvem se o localStorage estiver vazio
        // (primeiro acesso no dispositivo) OU se a nuvem for mais recente
        if (!local || !local.transactions || local.transactions.length === 0) {
          // Reconstrói o state no localStorage
          localStorage.setItem('financas-facil-data', JSON.stringify(cloudData))
          window.location.reload()
        }
      }
    })
  }, [user?.id])

  // Sincronizar para nuvem a cada 5 segundos se houver mudanças
  useEffect(() => {
    if (!user?.id) return

    const interval = setInterval(() => {
      const currentData = localStorage.getItem('financas-facil-data')
      if (currentData && currentData !== lastSync.current) {
        lastSync.current = currentData
        try {
          syncToCloud(user.id, 'store', JSON.parse(currentData))
        } catch {}
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [user?.id])

  return <>{children}</>
}
