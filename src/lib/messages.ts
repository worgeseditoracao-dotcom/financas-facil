import { supabase } from './supabase'
import { v4 as uuid } from 'uuid'

export interface MessageRow {
  id: string
  from_user_id: string
  from_email: string
  to_admin: boolean
  message: string
  read: boolean
  reply: string | null
  replied_at: string | null
  created_at: string
}

export async function getMessages(): Promise<MessageRow[]> {
  const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false })
  return data || []
}

export async function getMessagesByUser(userId: string): Promise<MessageRow[]> {
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('from_user_id', userId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function sendMessage(msg: { from_user_id: string; from_email: string; message: string }): Promise<MessageRow> {
  const entry: MessageRow = {
    id: uuid(),
    from_user_id: msg.from_user_id,
    from_email: msg.from_email,
    to_admin: true,
    message: msg.message,
    read: false,
    reply: null,
    replied_at: null,
    created_at: new Date().toISOString(),
  }
  const { data, error } = await supabase.from('messages').insert(entry).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function replyToMessage(messageId: string, reply: string): Promise<MessageRow | undefined> {
  const { data, error } = await supabase
    .from('messages')
    .update({ reply, replied_at: new Date().toISOString(), read: true })
    .eq('id', messageId)
    .select()
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data || undefined
}

export async function markMessageRead(messageId: string) {
  await supabase.from('messages').update({ read: true }).eq('id', messageId)
}

export async function getUnreadCount(): Promise<number> {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('to_admin', true)
    .eq('read', false)
  if (error) return 0
  return count || 0
}
