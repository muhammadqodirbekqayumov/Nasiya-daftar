import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const env = fs.readFileSync('.env.local', 'utf8')
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/)
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)

if (!urlMatch || !keyMatch) {
  console.error("No env variables found")
  process.exit(1)
}

const supabaseUrl = urlMatch[1].trim()
const supabaseAnonKey = keyMatch[1].trim()

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  console.log("Testing with URL:", supabaseUrl)
  // We try a random password just to see if the user exists
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@0707.com',
    password: 'wrongpassword123' 
  })

  if (error) {
    console.log("Status:", error.message)
    if (error.message.includes("Invalid login credentials")) {
        console.log("RESULT: The user 'admin@0707.com' exists but password/confirmation is wrong.")
    } else if (error.message.includes("Email not confirmed")) {
        console.log("RESULT: The user exists but needs email confirmation.")
    } else {
        console.log("RESULT: Other error - " + error.message)
    }
  } else {
    console.log("RESULT: SUCCESS! (Unexpectedly signed in with wrong password?)")
  }
}

test()
