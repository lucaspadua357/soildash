'use client'

import { useState, useMemo, useCallback } from 'react'
import TopBar from './components/TopBar'
import MetricCard from './components/MetricCard'
import HumidityChart from './components/HumidityChart'
import GaugeCard from './components/GaugeCard'
import DeviceInfo from './components/DeviceInfo'
import AlertsPanel from './components/AlertsPanel'
import WindCard from './components/WindCard'
import HistoryPage from './components/HistoryPage'
import ForecastPage from './components/ForecastPage'
import SettingsModal from './components/SettingsModal'
import SplashScreen from './components/SplashScreen'
import { useSensorData } from './lib/useSensorData'
import { useWeatherData } from './lib/useWeatherData'
import { useSettings } from './lib/useSettings'

const PAGES = ['history', 'dashboard', 'forecast'] as const
type Page = typeof PAGES[number]

const PAGE_LABELS: Record<Page, string> = {
  history: 'histórico',
  dashboard: 'dashboard',
  forecast: 'previsão',
}

export default function Dashboard() {
  const { settings, isSaving, saveSettings } = useSettings()
  const { data, isConnected, lastUpdate, timeRange, setTimeRange } = useSensorData(settings)
  const { weather, isLoaded } = useWeatherData()
  const [current, setCurrent] = useState<Page>('dashboard')
  const [showSplash, setShowSplash] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const index = PAGES.indexOf(current)

  const handleSettingsClose = useCallback(() => setSettingsOpen(false), [])
  const handleSettingsOpen = useCallback(() => setSettingsOpen(true), [])

  const settingsModal = useMemo(() => (
    <SettingsModal
      isOpen={settingsOpen}
      onClose={handleSettingsClose}
      settings={settings}
      isSaving={isSaving}
      onSave={saveSettings}
    />
  ), [settingsOpen, settings, isSaving, saveSettings, handleSettingsClose])

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />
  }

  return (
    <div className="fixed inset-0 bg-stone-950 text-stone-100 font-sans overflow-hidden">

      {/* Container deslizante */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${index * 100}vw)`, width: `${PAGES.length * 100}vw` }}
      >

        {/* Página 1 — Histórico */}
        <div className="w-screen h-full overflow-y-auto shrink-0">
          <HistoryPage />
        </div>

        {/* Página 2 — Dashboard */}
        <div className="w-screen h-full overflow-y-auto shrink-0">
          <div className="p-4 md:p-6 pb-20">
            <div className="max-w-5xl mx-auto space-y-4 pt-4">

              <TopBar
                isConnected={isConnected}
                lastUpdate={lastUpdate}
                onSettingsOpen={handleSettingsOpen}
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard
                  label="CONDIÇÃO DO SOLO"
                  value={data.humidity}
                  unit="%"
                  icon="🌱"
                  trend={data.humidityTrend}
                  status={data.humidity >= 85 ? 'high' : data.humidity < settings.humidity_min ? 'low' : 'ok'}
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
                    humidityMin={settings.humidity_min}
                    humidityMax={settings.humidity_max}
                  />
                </div>
                <GaugeCard
                  value={data.humidity}
                  humidityMin={settings.humidity_min}
                  humidityMax={settings.humidity_max}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:items-start">
                <div className="md:h-[420px] [&>*]:h-full">
                  <WindCard
                    speed={weather.windSpeed}
                    direction={weather.windDirection}
                    isLoaded={isLoaded}
                    latitude={settings.latitude}
                    longitude={settings.longitude}
                  />
                </div>

                <div className="md:h-[420px] [&>*]:h-full">
                  <DeviceInfo device={data.device} />
                </div>

                <AlertsPanel alerts={data.alerts} />
              </div>
            </div>
          </div>
        </div>

        {/* Página 3 — Previsão */}
        <div className="w-screen h-full overflow-y-auto shrink-0 pb-16">
          <ForecastPage
            latitude={settings.latitude}
            longitude={settings.longitude}
          />
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
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-stone-950/40 backdrop-blur-md
  border-t border-stone-800/50 px-4 py-1">
        <div className="flex items-center justify-around max-w-sm mx-auto">

          <button
            onClick={() => setCurrent('history')}
            className="flex flex-col items-center gap-0.5 py-1.5 px-6 group"
          >
            <svg viewBox="0 0 24 24" className={`w-5 h-5 transition-colors ${current === 'history' ? 'text-white' : 'text-stone-600 group-hover:text-stone-400'
              }`} fill="currentColor">
              <path d="M13 3a9 9 0 0 1 9 9H13V3zm0 9V3a9 9 0 1 0 9 9h-9z" />
            </svg>
            <span className={`text-[9px] font-medium transition-colors ${current === 'history' ? 'text-white' : 'text-stone-600 group-hover:text-stone-400'
              }`}>Histórico</span>
          </button>

          <button
            onClick={() => setCurrent('dashboard')}
            className="flex flex-col items-center gap-0.5 py-1.5 px-6 group"
          >
            <svg viewBox="0 0 24 24" className={`w-5 h-5 transition-colors ${current === 'dashboard' ? 'text-white' : 'text-stone-600 group-hover:text-stone-400'
              }`} fill="currentColor">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
            <span className={`text-[9px] font-medium transition-colors ${current === 'dashboard' ? 'text-white' : 'text-stone-600 group-hover:text-stone-400'
              }`}>Dashboard</span>
          </button>

          <button
            onClick={() => setCurrent('forecast')}
            className="flex flex-col items-center gap-0.5 py-1.5 px-6 group"
          >
            <svg viewBox="0 0 24 24" className={`w-5 h-5 transition-colors ${current === 'forecast' ? 'text-white' : 'text-stone-600 group-hover:text-stone-400'
              }`} fill="currentColor">
              <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z" />
            </svg>
            <span className={`text-[9px] font-medium transition-colors ${current === 'forecast' ? 'text-white' : 'text-stone-600 group-hover:text-stone-400'
              }`}>Previsão</span>
          </button>

        </div>
      </div>

      {/* Modal de configurações */}
      {settingsModal}

    </div>

  )
}