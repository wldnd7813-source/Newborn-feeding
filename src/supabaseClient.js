import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://innkwfssvezgkoyzsrzm.supabase.co'
const supabaseAnonKey = 'sb_publishable_-yT_CC6cTfL0ll5M10DdaA_JyXKdoyF'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)