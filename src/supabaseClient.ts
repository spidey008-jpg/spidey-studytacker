import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ivldxasmmecgpnpzbusk.supabase.co'
const supabaseAnonKey = 'sb_publishable_xII7sdnIodh_yqaXmgWdYg_1UuD2kxd'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)