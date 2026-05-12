import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string
  full_name?: string
  role: 'admin' | 'client'
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  profileLoading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  profileLoading: false,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)      // hanya untuk init pertama
  const [profileLoading, setProfileLoading] = useState(false)
  const fetchingRef = useRef(false)
  const lastUserIdRef = useRef<string | null>(null)

  const fetchProfile = async (userId: string) => {
    // Cegah duplicate fetch
    if (fetchingRef.current) return
    fetchingRef.current = true
    setProfileLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('id', userId)
        .single()
      if (!error && data) setProfile(data as Profile)
    } finally {
      fetchingRef.current = false
      setProfileLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (lastUserIdRef.current) await fetchProfile(lastUserIdRef.current)
  }

  useEffect(() => {
    let isMounted = true

    // Init: ambil session sekali saja
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return
      const currentUser = session?.user ?? null
      setUser(currentUser)
      lastUserIdRef.current = currentUser?.id ?? null
      if (currentUser) {
        fetchProfile(currentUser.id).finally(() => {
          if (isMounted) setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    // Listen perubahan auth — hanya proses event yang relevan
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return

      // Abaikan event yang tidak perlu re-fetch
      if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') return

      const nextUser = session?.user ?? null
      setUser(nextUser)

      if (!nextUser) {
        lastUserIdRef.current = null
        setProfile(null)
        return
      }

      // Hanya fetch ulang kalau user berbeda (login user baru)
      if (lastUserIdRef.current !== nextUser.id) {
        lastUserIdRef.current = nextUser.id
        setProfile(null)
        fetchProfile(nextUser.id)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    lastUserIdRef.current = null
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, profileLoading, signOut, refreshProfile }}>
      {/* 
        KUNCI PERBAIKAN: Jangan unmount children saat loading.
        Gunakan visibility/opacity agar HMR tidak destroy component tree.
      */}
      <div style={{ visibility: loading ? 'hidden' : 'visible' }}>
        {children}
      </div>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 z-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)