'use client'

import { useState } from 'react'
import TopBar from './components/TopBar'
import MetricCard from './components/MetricCard'
import HumidityChart from './components/HumidityChart'
import GaugeCard from './components/GaugeCard'
import DeviceInfo from './components/DeviceInfo'
import AlertsPanel from './components/AlertsPanel'
import WindCard from './components/WindCard'
import HistoryPage from './components/HistoryPage'
import ForecastPage from './components/ForecastPage'
import { useSensorData } from './lib/useSensorData'
import { useWeatherData } from './lib/useWeatherData'

const PAGES = ['history', 'dashboard', 'forecast'] as const
type Page = typeof PAGES[number]

const PAGE_LABELS: Record<Page, string> = {
  history:   'histórico',
  dashboard: 'dashboard',
  forecast:  'previsão',
}

export default function Dashboard() {
  const { data, isConnected, lastUpdate, timeRange, setTimeRange } = useSensorData()
  const { weather, isLoaded } = useWeatherData()
  const [current, setCurrent] = useState<Page>('dashboard')

  const index = PAGES.indexOf(current)

  return (
    <div className="fixed inset-0 bg-stone-950 text-stone-100 font-sans overflow-hidden">

      {/* Container deslizante */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${index * 100}vw)`, width: `${PAGES.length * 100}vw` }}
      >

        {/* Página 1 — Histórico */}
        <div className="w-screen h-full overflow-y-auto flex-shrink-0">
          <HistoryPage />
        </div>

        {/* Página 2 — Dashboard */}
        <div className="w-screen h-full overflow-y-auto flex-shrink-0">
          <div className="p-4 md:p-6 pb-16">
            <div className="max-w-5xl mx-auto space-y-4 pt-4">

              <TopBar isConnected={isConnected} lastUpdate={lastUpdate} />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard
                  label="UMIDADE SOLO"
                  value={data.humidity}
                  unit="%"
                  icon="💧"
                  trend={data.humidityTrend}
                  status={data.humidity < 30 ? 'low' : data.humidity > 80 ? 'high' : 'ok'}
                />
                <MetricCard
                  label="TEMPERATURA"
                  value={weather.temperature}
                  unit="°C"
                  icon="🌡️"
                  trend="Open-Meteo"
                  status="ok"
                />
                <MetricCard
                  label="UMIDADE AR"
                  value={weather.humidityAir}
                  unit="%"
                  icon="🌫️"
                  trend="Open-Meteo"
                  status="ok"
                />
                <MetricCard
                  label="RSSI WiFi"
                  value={data.rssi}
                  unit="dBm"
                  icon="📶"
                  trend={null}
                  status={data.rssi < -80 ? 'low' : 'ok'}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <HumidityChart
                    history={data.history}
                    timeRange={timeRange}
                    onRangeChange={setTimeRange}
                  />
                </div>
                <GaugeCard value={data.humidity} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <WindCard
                  speed={weather.windSpeed}
                  direction={weather.windDirection}
                  isLoaded={isLoaded}
                />
                <DeviceInfo device={data.device} />
                <AlertsPanel alerts={data.alerts} />
              </div>

            </div>
          </div>
        </div>

        {/* Página 3 — Previsão */}
        <div className="w-screen h-full overflow-y-auto flex-shrink-0 pb-16">
          <ForecastPage />
        </div>

      </div>

      {/* Seta esquerda */}
      {index > 0 && (
        <button
          onClick={() => setCurrent(PAGES[index - 1])}
          className="fixed left-3 top-1/2 -translate-y-1/2 z-50 w-8 h-8 rounded-full
            bg-stone-800 border border-stone-700 text-stone-400 hover:text-stone-200
            hover:border-stone-500 transition-colors flex items-center justify-center text-sm"
        >
          ←
        </button>
      )}

      {/* Seta direita */}
      {index < PAGES.length - 1 && (
        <button
          onClick={() => setCurrent(PAGES[index + 1])}
          className="fixed right-3 top-1/2 -translate-y-1/2 z-50 w-8 h-8 rounded-full
            bg-stone-800 border border-stone-700 text-stone-400 hover:text-stone-200
            hover:border-stone-500 transition-colors flex items-center justify-center text-sm"
        >
          →
        </button>
      )}

      {/* Footer — pontos de navegação */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
        {PAGES.map((p) => (
          <button
            key={p}
            onClick={() => setCurrent(p)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className={`transition-all duration-300 rounded-full ${
              current === p
                ? 'w-6 h-2 bg-stone-300'
                : 'w-2 h-2 bg-stone-600 group-hover:bg-stone-400'
            }`} />
            <span className={`text-[9px] font-mono transition-colors ${
              current === p ? 'text-stone-400' : 'text-stone-700 group-hover:text-stone-500'
            }`}>
              {PAGE_LABELS[p]}
            </span>
          </button>
        ))}
      </div>

    </div>
  )
}