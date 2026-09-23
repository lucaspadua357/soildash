'use client'

import { useEffect, useState, useCallback } from 'react'
import { Settings } from '../lib/useSettings'
import dynamic from 'next/dynamic'

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
    settings: Settings
    isSaving: boolean
    onSave: (s: Settings) => Promise<boolean>
}

export default function SettingsModal({
    isOpen, onClose, settings, isSaving, onSave
}: SettingsModalProps) {
    const [form, setForm] = useState<Settings>(settings)
    const [saved, setSaved] = useState(false)

    useEffect(() => { setForm(settings) }, [settings])

    useEffect(() => {
        const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    const handleSave = async () => {
        const ok = await onSave(form)
        if (ok) {
            setSaved(true)
            setTimeout(() => { setSaved(false); onClose() }, 1000)
        }
    }

    const MapPicker = dynamic(() => import('./MapPicker'), {
        ssr: false,
        loading: () => (
            <div className="w-full h-56 rounded-xl bg-stone-800 border border-stone-700 
      flex items-center justify-center">
                <p className="text-xs font-mono text-stone-600 animate-pulse">Carregando mapa...</p>
            </div>
        )
    })

    const handleMapChange = useCallback((lat: number, lon: number) => {
        setForm(f => ({ ...f, latitude: lat, longitude: lon }))
    }, [])

    if (!isOpen) return null

    return (
        <>
            <div
                className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
        w-full max-w-md bg-stone-900 rounded-2xl border border-stone-700 shadow-2xl p-6">

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-base font-semibold text-stone-100">Configurações</h2>
                        <p className="text-[10px] font-mono text-stone-500 mt-0.5">Salvo no Supabase</p>
                    </div>
                    <button onClick={onClose} className="text-stone-500 hover:text-stone-200 transition-colors text-xl">✕</button>
                </div>

                <div className="space-y-5">

                    {/* Localização */}
                    <div>
                        <label className="text-xs font-mono text-stone-400 block mb-2">
                            Localização do sensor
                        </label>
                        <p className="text-[10px] font-mono text-stone-600 mb-2">
                            Clique no mapa ou arraste o marcador até o ponto exato da propriedade
                        </p>
                        <MapPicker
                            initialLat={form.latitude}
                            initialLon={form.longitude}
                            onChange={handleMapChange}
                        />
                    </div>

                    {/* Limiares */}
                    <div>
                        <label className="text-xs font-mono text-stone-400 block mb-1.5">
                            Limiares de umidade para alertas
                        </label>

                        <div className="relative h-3 bg-stone-800 rounded-full mb-3 overflow-hidden">
                            <div
                                className="absolute h-full bg-green-500/30 rounded-full"
                                style={{ left: `${form.humidity_min}%`, width: `${form.humidity_max - form.humidity_min}%` }}
                            />
                            <div className="absolute h-full w-0.5 bg-amber-400" style={{ left: `${form.humidity_min}%` }} />
                            <div className="absolute h-full w-0.5 bg-blue-400" style={{ left: `${form.humidity_max}%` }} />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <p className="text-[10px] font-mono text-amber-400 mb-1">Mínimo (alerta seco)</p>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="range" min={0} max={form.humidity_max - 5} step={1}
                                        value={form.humidity_min}
                                        onChange={e => setForm(f => ({ ...f, humidity_min: parseInt(e.target.value) }))}
                                        className="flex-1 accent-amber-400"
                                    />
                                    <span className="text-sm font-mono text-amber-400 w-8 text-right">{form.humidity_min}%</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-mono text-blue-400 mb-1">Máximo (alerta saturado)</p>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="range" min={form.humidity_min + 5} max={100} step={1}
                                        value={form.humidity_max}
                                        onChange={e => setForm(f => ({ ...f, humidity_max: parseInt(e.target.value) }))}
                                        className="flex-1 accent-blue-400"
                                    />
                                    <span className="text-sm font-mono text-blue-400 w-8 text-right">{form.humidity_max}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-mono text-stone-600">Zona ideal:</span>
                            <span className="text-[10px] font-mono text-green-400">
                                {form.humidity_min}% – {form.humidity_max}%
                            </span>
                        </div>
                    </div>

                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-stone-800">
                    <button
                        onClick={onClose}
                        className="text-xs font-mono text-stone-500 hover:text-stone-300 px-4 py-2 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`text-xs font-mono px-4 py-2 rounded-lg transition-all ${saved ? 'bg-green-600 text-white' : 'bg-stone-700 text-stone-200 hover:bg-stone-600'
                            } disabled:opacity-50`}
                    >
                        {saved ? '✓ salvo!' : isSaving ? 'salvando...' : 'salvar'}
                    </button>
                </div>
            </div>
        </>
    )
}