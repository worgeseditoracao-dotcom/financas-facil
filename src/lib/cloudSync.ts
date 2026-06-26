import { supabase } from './supabase'

const SYNC_TABLE = 'user_data'

export async function syncToCloud(userId: string, key: string, data: any) {
  try {
    const { error } = await supabase
      .from(SYNC_TABLE)
      .upsert({
        user_id: userId,
        key,
        data: JSON.stringify(data),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,key' })

    if (error && error.message.includes('not find')) {
      // Tabela não existe, salva via upsert comum
      await supabase.from(SYNC_TABLE).upsert({
        user_id: userId,
        key,
        data: JSON.stringify(data),
        updated_at: new Date().toISOString(),
      }).select()
    }
  } catch {}
}

export async function loadFromCloud(userId: string, key: string): Promise<any | null> {
  try {
    const { data: rows, error } = await supabase
      .from(SYNC_TABLE)
      .select('data')
      .eq('user_id', userId)
      .eq('key', key)
      .maybeSingle()

    if (error) return null
    if (rows?.data) {
      try { return JSON.parse(rows.data) } catch { return null }
    }
    return null
  } catch {
    return null
  }
}

export async function ensureSyncTable() {
  const { error } = await supabase.from(SYNC_TABLE).select('user_id').limit(1)
  if (error && error.message.includes('not find')) {
    console.warn('Tabela user_data não existe. Execute o SQL para criar.')
  }
}
