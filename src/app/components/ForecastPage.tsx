'use client'

import { useWeatherForecast } from '../lib/useWeatherForecast'
import { useCityName } from '../lib/useCityName'

interface ForecastPageProps {
  latitude:  number
  longitude: number
}

const WEATHER_CODES: Record<number, { label: string; icon: string }> = {
  0:  { label: 'Céu limpo',        icon: '☀️' },
  1:  { label: 'Predomin. limpo',  icon: '🌤️' },
  2:  { label: 'Parcial. nublado', icon: '⛅' },
  3:  { label: 'Nublado',          icon: '☁️' },
  45: { label: 'Neblina',          icon: '🌫️' },
  51: { label: 'Garoa leve',       icon: '🌦️' },
  61: { label: 'Chuva leve',       icon: '🌧️' },
  63: { label: 'Chuva moderada',   icon: '🌧️' },
  65: { label: 'Chuva forte',      icon: '🌧️' },
  80: { label: 'Pancadas',         icon: '⛈️' },
  95: { label: 'Trovoada',         icon: '🌩️' },
}

function getWeather(code: number) {
  return WEATHER_CODES[code] ?? { label: 'Variável', icon: '🌡️' }
}

function formatDate(dateStr: string, i: number) {
  if (i === 0) return 'Hoje'
  if (i === 1) return 'Amanhã'
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: '2-digit'
  })
}

export default function ForecastPage({ latitude, longitude }: ForecastPageProps) {
  const { forecast, isLoaded } = useWeatherForecast()
  const cityName = useCityName(latitude, longitude)

  return (
    <div className="min-h-screen bg-stone-950/40 p-4 md:p-6">
      <div className="max-w-3xl mx-auto pt-8 pb-16">

        <div className="text-center mb-6">
          <h1 className="text-lg font-semibold text-stone-100">Previsão do tempo</h1>
          <p className="text-xs font-mono text-stone-500 mt-0.5">
            {cityName} · 7 dias · Open-Meteo
          </p>
        </div>

        {!isLoaded ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-xs font-mono text-stone-600 animate-pulse">Carregando previsão...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {forecast.map((day, i) => {
              const { label, icon } = getWeather(day.weatherCode)
              return (
                <div
                  key={day.date}
                  className={`rounded-xl border p-4 ${
                    i === 0 ? 'bg-stone-800 border-stone-600' : 'bg-stone-900 border-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-stone-200 capitalize">
                          {formatDate(day.date, i)}
                        </p>
                        <p className="text-xs font-mono text-stone-500">{label}</p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold font-mono text-orange-400">
                        {day.tempMax.toFixed(0)}°
                      </span>
                      <span className="text-sm font-mono text-blue-400">
                        {day.tempMin.toFixed(0)}°
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-stone-950/50 rounded-lg px-3 py-2 text-center">
                      <p className="text-[10px] font-mono text-stone-500">Chuva</p>
                      <p className="text-sm font-mono text-cyan-400 font-bold">
                        {day.precipitation.toFixed(1)}mm
                      </p>
                    </div>
                    <div className="bg-stone-950/50 rounded-lg px-3 py-2 text-center">
                      <p className="text-[10px] font-mono text-stone-500">Chance de chuva</p>
                      <p className={`text-sm font-mono font-bold ${
                        day.rainChance > 70 ? 'text-blue-400' :
                        day.rainChance > 40 ? 'text-cyan-400' :
                        'text-stone-400'
                      }`}>
                        {day.rainChance}%
                      </p>
                    </div>
                    <div className="bg-stone-950/50 rounded-lg px-3 py-2 text-center">
                      <p className="text-[10px] font-mono text-stone-500">Vento máximo</p>
                      <p className="text-sm font-mono text-blue-400 font-bold">
                        {day.windSpeed.toFixed(1)}m/s
                      </p>
                    </div>
                    <div className="bg-stone-950/50 rounded-lg px-3 py-2 text-center">
                      <p className="text-[10px] font-mono text-stone-500">Umid. ar</p>
                      <p className="text-sm font-mono text-green-400 font-bold">
                        {day.humidity}%
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <p className="text-center text-[10px] font-mono text-stone-700 mt-6">
          Open-Meteo · Atualiza a cada hora
        </p>

      </div>
    </div>
  )
}