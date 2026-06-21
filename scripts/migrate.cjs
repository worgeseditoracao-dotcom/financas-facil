const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://pkampjlywarrfmodmvaj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrYW1wamx5d2FycmZtb2RtdmFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjA2OTk5NCwiZXhwIjoyMDk3NjQ1OTk0fQ.iPFb1T914f3_Q3wVxxLtNPRqZy9e37HZa_9NZPBJysM'
)

async function run() {
  console.log('Verificando tabelas...')

  let { error: e1 } = await supabase.from('users').select('id').limit(1)
  console.log('  users:', e1 ? '❌ NÃO EXISTE' : '✅ OK')

  let { error: e2 } = await supabase.from('purchases').select('id').limit(1)
  console.log('  purchases:', e2 ? '❌ NÃO EXISTE' : '✅ OK')

  let { error: e3 } = await supabase.from('webhook_logs').select('id').limit(1)
  console.log('  webhook_logs:', e3 ? '❌ NÃO EXISTE' : '✅ OK')

  if (e1 || e2 || e3) {
    console.log('\n❌ Falta criar tabelas. Execute no SQL Editor:')
    console.log('   https://supabase.com/dashboard/project/pkampjlywarrfmodmvaj/sql/new')
    console.log('   O SQL está no seu clipboard (Cmd+V)')
  } else {
    console.log('\n✅ Banco pronto!')
  }
}

run().catch(e => console.error('Erro:', e.message))
