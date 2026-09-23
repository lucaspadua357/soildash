# SoilDash — Dashboard

Dashboard web em **Next.js 15 + Tailwind CSS v4** para monitoramento de umidade do solo em tempo real, integrado com **Supabase** para persistência e **Open-Meteo** para dados meteorológicos.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 15 (App Router) + React 19 |
| Estilo | Tailwind CSS v4 + Syne + DM Mono |
| Gráficos | Recharts |
| Banco de dados | Supabase (PostgreSQL) |
| Meteorologia | Open-Meteo API (gratuita, sem cadastro) |
| Mapa | Leaflet + Esri Satellite |
| Deploy | Vercel |

## Estrutura

```
src/app/
├── page.tsx                      # Navegação entre páginas
├── layout.tsx                    # Root layout + SEO + Open Graph
├── globals.css                   # Tailwind v4 + tema
├── api/
│   ├── sensor/route.ts           # Lê última leitura do Supabase
│   ├── weather/route.ts          # Clima atual (Open-Meteo)
│   ├── forecast/route.ts         # Previsão 7 dias (Open-Meteo)
│   ├── settings/route.ts         # CRUD de configurações
│   └── og-image/route.tsx        # Imagem Open Graph dinâmica
├── components/
│   ├── TopBar.tsx                # Status + botão configurações
│   ├── MetricCard.tsx            # Cards de métricas
│   ├── HumidityChart.tsx         # Gráfico de barras (1h/12h/7d)
│   ├── GaugeCard.tsx             # Gauge semicircular
│   ├── WindCard.tsx              # Rosa dos ventos + velocidade
│   ├── DeviceInfo.tsx            # Info do ESP32
│   ├── AlertsPanel.tsx           # Alertas com timestamp
│   ├── HistoryPage.tsx           # Histórico + estatísticas + CSV
│   ├── ForecastPage.tsx          # Previsão 7 dias
│   ├── SettingsModal.tsx         # Modal de configurações
│   ├── MapPicker.tsx             # Mapa satélite interativo
│   └── SplashScreen.tsx          # Tela de abertura animada
└── lib/
    ├── useSensorData.ts          # Hook principal (polling + histórico RPC)
    ├── useWeatherData.ts         # Hook meteorológico
    ├── useWeatherForecast.ts     # Hook previsão 7 dias
    ├── useSettings.ts            # Hook de configurações
    ├── useCityName.ts            # Geocoding reverso (Nominatim)
    └── supabase.ts               # Cliente Supabase (anon + admin)
```

## Instalação

```bash
cd dashboard
npm install
cp .env.local.example .env.local
# preencha as variáveis de ambiente
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
-- Tabela de leituras
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

-- Tabela de configurações
CREATE TABLE settings (
  id           text PRIMARY KEY DEFAULT 'default',
  sensor_name  text DEFAULT 'SoilDash',
  latitude     float DEFAULT -22.2519,
  longitude    float DEFAULT -45.7044,
  humidity_min integer DEFAULT 30,
  humidity_max integer DEFAULT 75,
  updated_at   timestamptz DEFAULT now()
);

INSERT INTO settings (id) VALUES ('default');

ALTER TABLE readings DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- Função RPC para agregação eficiente do gráfico
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

## Navegação

O dashboard tem **3 páginas** navegáveis pelo footer estilo Spotify:

| Página | Ícone | Conteúdo |
|---|---|---|
| Histórico | 📊 | Estatísticas, mini gráfico, tabela de leituras, exportar CSV |
| Dashboard | ⊞ | Métricas ao vivo, gráfico, gauge, vento, alertas |
| Previsão | ☀️ | Previsão 7 dias com temperatura, chuva, chance de chuva, vento |

## Configurações (⚙️)

Acessível pelo botão de engrenagem no TopBar:

- **Localização** — mapa satélite interativo (Esri) para marcar o ponto exato da propriedade
- **Limiares de umidade** — sliders para definir mín/máx dos alertas
- Salvo automaticamente no Supabase

## Gráfico de umidade

- **1h** → 1 ponto a cada 10 minutos (via RPC Supabase)
- **12h** → 1 ponto por hora
- **7d** → 1 ponto por dia
- Cores dinâmicas conforme os limiares configurados

## Deploy

```bash
git add .
git commit -m "sua mensagem"
git push
```

A Vercel faz deploy automático a cada push na branch `main`.

## Concluído

- [x] Dashboard Next.js com 3 páginas deslizantes
- [x] Gráfico de barras com cores por faixa de umidade
- [x] Histórico completo com exportação CSV
- [x] Previsão meteorológica 7 dias (Open-Meteo)
- [x] Rosa dos ventos com velocidade e direção
- [x] Modal de configurações com mapa satélite
- [x] Limiares de umidade configuráveis
- [x] Localização via mapa interativo
- [x] SEO + Open Graph dinâmico
- [x] Tela de abertura animada
- [x] Deploy na Vercel

## Próximos passos

- [ ] Alertas por Telegram/email
- [ ] Suporte a múltiplos sensores
- [ ] App mobile