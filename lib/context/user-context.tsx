"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/supabase/database.types"

type Profile = Database['public']['Tables']['profiles']['Row']

interface UserContextValue {
  user: User | null
  profile: Profile | null
  loading: boolean
  refetchProfile: () => void
}

const UserContext = createContext<UserContextValue>({ user: null, profile: null, loading: true, refetchProfile: () => {} })

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileKey, setProfileKey] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setProfile(null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch profile when user is available
  useEffect(() => {
    if (!user) return

    const supabase = createClient()
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data as Profile)
      })
  }, [user, profileKey])

  const refetchProfile = () => setProfileKey(k => k + 1)

  return (
    <UserContext.Provider value={{ user, profile, loading, refetchProfile }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
