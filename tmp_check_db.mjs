import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const env = fs.readFileSync('.env.local', 'utf8')
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/)
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)

const supabaseUrl = urlMatch[1].trim()
const supabaseAnonKey = keyMatch[1].trim()

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugData() {
  console.log("--- PROFILES TABLE ---")
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*')
  if (pErr) console.error("Profiles Error:", pErr.message)
  else console.log(JSON.stringify(profiles, null, 2))

  console.log("--- LOGGED IN USER ---")
  const { data: { user } } = await supabase.auth.getUser()
  console.log("Current User:", user?.email)
}

debugData()
