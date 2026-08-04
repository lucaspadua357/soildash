# SoilWatch — Dashboard de Monitoramento de Solo

Dashboard em **Next.js 14 + Tailwind CSS** para monitoramento em tempo real de umidade do solo
via **ESP32-WiFi** com sensor **HD-38**.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router) + React 18 |
| Estilo | Tailwind CSS + Syne + DM Mono |
| Gráficos | Recharts |
| Hardware | ESP32-WROOM + Sensor HD-38 |
| Protocolo | HTTP polling (5s) via API route proxy |

## Estrutura

```
src/app/
├── page.tsx                  # Dashboard principal
├── layout.tsx                # Root layout (dark mode, fontes)
├── globals.css
├── api/
│   └── sensor/route.ts       # Proxy GET → ESP32 (evita CORS)
├── components/
│   ├── TopBar.tsx            # Status de conexão + IP
│   ├── MetricCard.tsx        # Cards de leitura (umidade, temp…)
│   ├── HumidityChart.tsx     # Gráfico de área 24h
│   ├── GaugeCard.tsx         # Gauge semicircular
│   ├── DeviceInfo.tsx        # Info do firmware/chip
│   └── AlertsPanel.tsx       # Alertas com timestamp
└── lib/
    └── useSensorData.ts      # Hook de dados (polling + estado)
```

## Instalação

```bash
npm install
cp .env.local.example .env.local   # ajuste o IP do ESP32
npm run dev
```

## Integração com ESP32

O ESP32 deve expor um endpoint **GET /data** que retorna:

```json
{
  "humidity": 63.4,
  "temperature": 24.1,
  "conductivity": 1.4,
  "rssi": -62
}
```

O hook `useSensorData.ts` faz polling a cada **5 segundos** via `/api/sensor`
(API Route do Next.js que age como proxy, evitando problemas de CORS).

## Próximos passos

- [ ] Firmware ESP32 com Wi-Fi + endpoint `/data`
- [ ] Calibração do sensor HD-38 (mapeamento ADC → %)
- [ ] Persistência com banco de dados (Supabase / SQLite)
- [ ] Alertas por email/Telegram quando umidade sair da faixa
- [ ] Configuração de limiares pelo dashboard
