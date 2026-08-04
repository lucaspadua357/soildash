'use client'

import { useState, useEffect } from 'react'
import TopBar from './components/TopBar'
import MetricCard from './components/MetricCard'
import HumidityChart from './components/HumidityChart'
import GaugeCard from './components/GaugeCard'
import DeviceInfo from './components/DeviceInfo'
import AlertsPanel from './components/AlertsPanel'
import { useSensorData } from './lib/useSensorData'

export default function Dashboard() {
  const { data, isConnected, lastUpdate } = useSensorData()

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 font-sans p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">

        <TopBar isConnected={isConnected} lastUpdate={lastUpdate} />

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            label="UMIDADE"
            value={data.humidity}
            unit="%"
            icon="💧"
            trend={data.humidityTrend}
            status={data.humidity < 30 ? 'low' : data.humidity > 80 ? 'high' : 'ok'}
          />
          <MetricCard
            label="TEMPERATURA"
            value={data.temperature}
            unit="°C"
            icon="🌡️"
            trend={data.tempTrend}
            status="ok"
          />
          <MetricCard
            label="CONDUTIVIDADE"
            value={data.conductivity}
            unit="mS"
            icon="⚡"
            trend={data.conductivityTrend}
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

        {/* Chart + Gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <HumidityChart history={data.history} />
          </div>
          <GaugeCard value={data.humidity} />
        </div>

        {/* Device Info + Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DeviceInfo device={data.device} />
          <AlertsPanel alerts={data.alerts} />
        </div>

      </div>
    </main>
  )
}
