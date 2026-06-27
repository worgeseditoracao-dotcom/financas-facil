import { supabase } from './supabase'

const SYNC_TABLE = 'user_data'
let tableOk = false
let checked = false

async function ensure() {
  if (checked) return tableOk
  checked = true
  try {
    const { error } = await supabase.from(SYNC_TABLE).select('user_id').limit(1)
    tableOk = !error
  } catch { tableOk = false }
  return tableOk
}

export async function syncToCloud(userId: string, key: string, data: any) {
  if (!await ensure()) return
  try {
    await supabase.from(SYNC_TABLE).upsert({
      user_id: userId, key, data: JSON.stringify(data),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,key' })
  } catch {}
}

export async function loadFromCloud(userId: string, key: string): Promise<any | null> {
  if (!await ensure()) return null
  try {
    const { data: rows } = await supabase.from(SYNC_TABLE)
      .select('data').eq('user_id', userId).eq('key', key).maybeSingle()
    if (rows?.data) {
      try { return JSON.parse(rows.data) } catch { return null }
    }
  } catch {}
  return null
}
