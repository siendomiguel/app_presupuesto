"use client"

import { useCallback, useEffect, useState } from 'react'
import { profilesService } from '@/lib/services/profiles'
import { Database } from '@/lib/supabase/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export function useProfile(userId: string | undefined) {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    const refetch = useCallback(() => setRefreshKey(k => k + 1), [])

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }

        const fetchProfile = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await profilesService.getProfile(userId)
                setProfile(data)
            } catch (err) {
                setError(err as Error)
                console.error('Error fetching profile:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [userId, refreshKey])

    return { profile, loading, error, refetch }
}
