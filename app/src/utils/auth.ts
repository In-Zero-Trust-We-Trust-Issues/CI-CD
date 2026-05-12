import { supabase } from "../lib/supabase"

export interface User {
  username: string
  fullName: string
  email?: string
  confirmed_at: string
  last_sign_in_at: string
  created_at: string
  updated_at: string
}

export const islogin = async (email: string, password: string): Promise<boolean> => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) return false
  return true
}

export const isAuthenticated = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession()
  return !!data.session
}

export const getCurrentUser = async (): Promise<User | null> => {
  const { data } = await supabase.auth.getUser()
  if (!data.user) return null
  return {
    username: data.user.email || "",
    fullName: data.user.user_metadata?.full_name || "",
    email: data.user.email || undefined,
    updated_at: data.user.updated_at || "",
    last_sign_in_at: data.user.last_sign_in_at || "",
    created_at: data.user.created_at || "",
    confirmed_at: data.user.confirmed_at || "",
  }
}

export const updateUserProfile = async (fullname: string): Promise<void> => {
  // Hanya update metadata (full_name), JANGAN update email via sini
  // karena email update butuh konfirmasi dan trigger session refresh
  const { error } = await supabase.auth.updateUser({
    data: { full_name: fullname },
  })
  if (error) throw error

  // Sync ke tabel profiles juga
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase
      .from('profiles')
      .update({ full_name: fullname })
      .eq('id', user.id)
  }
}

export const logout = async (): Promise<void> => {
  await supabase.auth.signOut()
}