'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Settings {
  latitude:     number
  longitude:    number
  humidity_min: number
  humidity_max: number
}

const defaults: Settings = {
  latitude:     -22.2519,
  longitude:    -45.7044,
  humidity_min: 30,
  humidity_max: 75,
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaults)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving]   = useState(false)

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setSettings(data)
    } catch (err) {
      console.error('[Settings] Erro ao buscar:', err)
    }
    setIsLoading(false)
  }, [])

  const saveSettings = useCallback(async (next: Settings) => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(next),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setSettings(next)
      setIsSaving(false)
      return true
    } catch (err) {
      console.error('[Settings] Erro ao salvar:', err)
      setIsSaving(false)
      return false
    }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  return { settings, isLoading, isSaving, saveSettings }
}