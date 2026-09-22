# SoilDash — Dashboard de Monitoramento de Solo

Dashboard em **Next.js 15 + Tailwind CSS v4** para monitoramento em tempo real de umidade do solo
via **ESP32-WiFi** com sensor **HD-38**, integrado com **Supabase** para persistência e
**Open-Meteo** para dados meteorológicos.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 15 (App Router) + React 19 |
| Estilo | Tailwind CSS v4 + Syne + DM Mono |
| Gráficos | Recharts |
| Banco de dados | Supabase (PostgreSQL) |
| Meteorologia | Open-Meteo API (gratuita, sem cadastro) |
| Hardware | ESP32-WROOM + Sensor HD-38 (GPIO34) |
| Protocolo | ESP32 → POST direto ao Supabase via HTTPS |
| Deploy | Vercel |

## Estrutura
soilwatch/
├── dashboard/ # Aplicação Next.js
│ ├── src/app/
│ │ ├── page.tsx # Navegação entre páginas (histórico, dashboard, previsão)
│ │ ├── layout.tsx # Root layout (dark mode, fontes)
│ │ ├── globals.css # Tailwind v4 + tema
│ │ ├── api/
│ │ │ ├── sensor/route.ts # Lê última leitura do Supabase
│ │ │ ├── weather/route.ts # Dados meteorológicos atuais (Open-Meteo)
│ │ │ └── forecast/route.ts # Previsão 7 dias (Open-Meteo)
│ │ ├── components/
│ │ │ ├── TopBar.tsx # Status de conexão + IP + última atualização
│ │ │ ├── MetricCard.tsx # Cards: umidade, temperatura, umidade do ar, RSSI
│ │ │ ├── HumidityChart.tsx # Gráfico de linha com pontos (1h / 12h / 7d)
│ │ │ ├── GaugeCard.tsx # Gauge semicircular com status dinâmico
│ │ │ ├── WindCard.tsx # Rosa dos ventos + velocidade (Open-Meteo)
│ │ │ ├── DeviceInfo.tsx # Info do firmware, chip, GPIO, uptime
│ │ │ ├── AlertsPanel.tsx # Alertas com timestamp relativo
│ │ │ ├── HistoryPage.tsx # Página de histórico com estatísticas + exportar CSV
│ │ │ ├── ForecastPage.tsx # Página de previsão 7 dias
│ │ │ └── WeatherDrawer.tsx # Drawer lateral de previsão
│ │ └── lib/
│ │ ├── useSensorData.ts # Hook principal — polling + histórico via RPC
│ │ ├── useWeatherData.ts # Hook meteorológico (Open-Meteo)
│ │ ├── useWeatherForecast.ts # Hook de previsão 7 dias
│ │ └── supabase.ts # Cliente Supabase (anon + admin)
│ └── .env.local.example
└── firmware/ # Firmware ESP32 (PlatformIO)
├── platformio.ini
├── include/config.h # WiFi, pinos, calibração HD-38
└── src/main.cpp # Leitura HD-38 + envio HTTPS ao Supabase

## Instalação

```bash
cd dashboard
npm install
cp .env.local.example .env.local
npm run dev
```

## Variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_KEY=sua_service_key
```

## Banco de dados (Supabase)

```sql
CREATE TABLE readings (
  id          bigserial PRIMARY KEY,
  created_at  timestamptz DEFAULT now(),
  humidity    float,
  wind_speed  float,
  temperature float,
  rssi        integer,
  uptime      integer,
  raw_adc     integer,
  firmware    text
);

-- Função RPC para agregação eficiente dos dados do gráfico
CREATE OR REPLACE FUNCTION get_humidity_history(
  range_minutes INTEGER,
  bucket_minutes INTEGER
)
RETURNS TABLE (bucket_time TIMESTAMPTZ, avg_humidity FLOAT)
LANGUAGE sql STABLE AS $$
  SELECT
    date_trunc('minute', created_at) -
      (EXTRACT(MINUTE FROM created_at)::INTEGER % bucket_minutes) * INTERVAL '1 minute',
    ROUND(AVG(humidity)::NUMERIC, 1)
  FROM readings
  WHERE created_at >= NOW() - (range_minutes || ' minutes')::INTERVAL
  GROUP BY 1
  ORDER BY 1 ASC;
$$;
```

## Firmware ESP32

O ESP32 envia dados diretamente ao Supabase via HTTPS a cada **5 segundos**,
sem depender do dashboard estar aberto.
Ligação HD-38:
AOUT → GPIO34 (S da placa de expansão)
VCC → 3.3V (V da placa de expansão)
GND → GND (G da placa de expansão)

Para gravar:
1. Edite `firmware/include/config.h` com SSID e senha do WiFi
2. Desconecte os fios do módulo RS485 antes de gravar
3. Grave com **→ Upload** no PlatformIO
4. Reconecte os fios após a gravação

## Navegação do dashboard

O dashboard tem **3 páginas** navegáveis pelas setas laterais ou pelos pontos no footer:

| Página | Conteúdo |
|---|---|
| ← Histórico | Estatísticas, mini gráfico, tabela de leituras + exportar CSV |
| Dashboard | Métricas ao vivo, gráfico de umidade, gauge, vento, alertas |
| Previsão → | Previsão 7 dias com temperatura, chuva, chance de precipitação |

## Deploy

O dashboard está deployado na Vercel com deploy automático a cada push na branch `main`.
O ESP32 envia dados independente de onde o dashboard está hospedado.

## Concluído

- [x] Dashboard Next.js com 3 páginas deslizantes
- [x] Firmware ESP32 com envio direto ao Supabase
- [x] Gráfico de umidade com agregação via RPC (1h / 12h / 7d)
- [x] Histórico completo com exportação CSV
- [x] Previsão meteorológica 7 dias (Open-Meteo)
- [x] Dados ao vivo: temperatura, umidade do ar, vento
- [x] Deploy na Vercel
- [x] Sensor HD-38 calibrado

## Próximos passos

- [ ] Anemômetro RS485 físico (módulo HW-726 — aguardando cabos jumper)
- [ ] Alertas por Telegram quando umidade sair da faixa
- [ ] Suporte a múltiplos sensores
- [ ] Configuração de limiares pelo dashboard