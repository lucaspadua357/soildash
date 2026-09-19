'use client'

import { useState } from 'react'
import TopBar from './components/TopBar'
import MetricCard from './components/MetricCard'
import HumidityChart from './components/HumidityChart'
import GaugeCard from './components/GaugeCard'
import DeviceInfo from './components/DeviceInfo'
import AlertsPanel from './components/AlertsPanel'
import WindCard from './components/WindCard'
import WeatherDrawer from './components/WeatherDrawer'
import { useSensorData } from './lib/useSensorData'
import { useWeatherData } from './lib/useWeatherData'

export default function Dashboard() {
  const { data, isConnected, lastUpdate, timeRange, setTimeRange } = useSensorData()
  const { weather, isLoaded } = useWeatherData()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 font-sans p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">

        <div className="flex items-center justify-between">
          <TopBar isConnected={isConnected} lastUpdate={lastUpdate} />
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-700
              text-xs font-mono text-stone-400 hover:text-stone-200 hover:border-stone-500
              transition-colors"
          >
            <span>☁️</span>
            <span>previsão 7 dias</span>
            <span className="text-stone-600">→</span>
          </button>
        </div>

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

      <WeatherDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </main>
  )
}