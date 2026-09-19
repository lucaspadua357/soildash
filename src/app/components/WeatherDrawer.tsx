'use client'

import { useEffect, useState } from 'react'
import { useWeatherForecast } from '../lib/useWeatherForecast'

const WEATHER_CODES: Record<number, { label: string; icon: string }> = {
  0:  { label: 'Céu limpo',       icon: '☀️' },
  1:  { label: 'Predomin. limpo', icon: '🌤️' },
  2:  { label: 'Parcial. nublado',icon: '⛅' },
  3:  { label: 'Nublado',         icon: '☁️' },
  45: { label: 'Neblina',         icon: '🌫️' },
  48: { label: 'Neblina gelada',  icon: '🌫️' },
  51: { label: 'Garoa leve',      icon: '🌦️' },
  53: { label: 'Garoa moderada',  icon: '🌦️' },
  55: { label: 'Garoa intensa',   icon: '🌧️' },
  61: { label: 'Chuva leve',      icon: '🌧️' },
  63: { label: 'Chuva moderada',  icon: '🌧️' },
  65: { label: 'Chuva forte',     icon: '🌧️' },
  80: { label: 'Pancadas leves',  icon: '⛈️' },
  81: { label: 'Pancadas moder.', icon: '⛈️' },
  82: { label: 'Pancadas fortes', icon: '⛈️' },
  95: { label: 'Trovoada',        icon: '🌩️' },
  99: { label: 'Trovoada c/ granizo', icon: '🌩️' },
}

function getWeather(code: number) {
  return WEATHER_CODES[code] ?? { label: 'Desconhecido', icon: '❓' }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

interface WeatherDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function WeatherDrawer({ isOpen, onClose }: WeatherDrawerProps) {
  const { forecast, isLoaded } = useWeatherForecast()

  // Fecha ao pressionar ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-stone-900 border-l border-stone-800 z-50
          flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800">
          <div>
            <h2 className="text-sm font-semibold text-stone-100">Previsão do tempo</h2>
            <p className="text-[10px] font-mono text-stone-500 mt-0.5">
              Santa Rita do Sapucaí · 7 dias
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-200 transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Lista de dias */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {!isLoaded ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-xs font-mono text-stone-500 animate-pulse">carregando...</p>
            </div>
          ) : (
            forecast.map((day, i) => {
              const { label, icon } = getWeather(day.weatherCode)
              const isToday = i === 0
              return (
                <div
                  key={day.date}
                  className={`rounded-xl p-3 border transition-colors ${
                    isToday
                      ? 'bg-stone-800 border-stone-600'
                      : 'bg-stone-950 border-stone-800'
                  }`}
                >
                  {/* Data + clima */}
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs font-semibold text-stone-200 capitalize">
                        {isToday ? 'Hoje' : formatDate(day.date)}
                      </p>
                      <p className="text-[10px] font-mono text-stone-500">{label}</p>
                    </div>
                    <span className="text-2xl">{icon}</span>
                  </div>

                  {/* Temperatura */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold font-mono text-orange-400">
                      {day.tempMax.toFixed(0)}°
                    </span>
                    <span className="text-xs text-stone-600">/</span>
                    <span className="text-sm font-mono text-blue-400">
                      {day.tempMin.toFixed(0)}°
                    </span>
                    <span className="text-[10px] font-mono text-stone-600 ml-auto">°C</span>
                  </div>

                  {/* Métricas */}
                  <div className="grid grid-cols-3 gap-1">
                    <div className="bg-stone-900 rounded-lg px-2 py-1 text-center">
                      <p className="text-[9px] font-mono text-stone-500">chuva</p>
                      <p className="text-[11px] font-mono text-cyan-400">
                        {day.precipitation.toFixed(1)}mm
                      </p>
                    </div>
                    <div className="bg-stone-900 rounded-lg px-2 py-1 text-center">
                      <p className="text-[9px] font-mono text-stone-500">vento</p>
                      <p className="text-[11px] font-mono text-blue-400">
                        {day.windSpeed.toFixed(1)}m/s
                      </p>
                    </div>
                    <div className="bg-stone-900 rounded-lg px-2 py-1 text-center">
                      <p className="text-[9px] font-mono text-stone-500">umid. ar</p>
                      <p className="text-[11px] font-mono text-green-400">
                        {day.humidity}%
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-800">
          <p className="text-[10px] font-mono text-stone-600 text-center">
            Open-Meteo · atualiza a cada hora
          </p>
        </div>
      </div>
    </>
  )
}