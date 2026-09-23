interface DeviceData {
  firmware: string
  chip: string
  sensorPin: string
  interval: number
  uptime: string
  ip: string
}

interface DeviceInfoProps {
  device: DeviceData
}

interface Row {
  key: keyof DeviceData
  label: string
  suffix?: string
}

const rows: Row[] = [
  { key: 'firmware',  label: 'Firmware' },
  { key: 'chip',      label: 'Chip' },
  { key: 'sensorPin', label: 'Sensor / GPIO' },
  { key: 'interval',  label: 'Intervalo', suffix: 's' },
  { key: 'uptime',    label: 'Uptime' },
]

export default function DeviceInfo({ device }: DeviceInfoProps) {
  return (
    <div className="bg-stone-900 rounded-xl border border-stone-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-stone-200">Dispositivo ESP32</h2>
        <span className="text-[10px] font-mono text-stone-500 bg-stone-800 px-2 py-1 rounded">WiFi STA</span>
      </div>

      <div className="space-y-0">
        {rows.map(({ key, label, suffix }, i) => (
          <div
            key={key}
            className={`flex justify-between items-center py-2 text-xs font-mono ${
              i < rows.length - 1 ? 'border-b border-stone-800' : ''
            }`}
          >
            <span className="text-stone-500">{label}</span>
            <span className="text-stone-200 font-medium">
              {device[key]}{suffix ?? ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}