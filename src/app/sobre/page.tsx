import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sobre o SoilDash — Projeto FETIN 2026, Inatel',
  description:
    'Como o SoilDash mede a umidade do solo em tempo real com ESP32 e sensor HD-38, e envia os dados para um dashboard web. Projeto do FETIN 2026, no Inatel.',
  alternates: { canonical: 'https://soildash.vercel.app/sobre' },
}

const pipeline = [
  {
    n: '01',
    title: 'Sensor HD-38',
    body: 'Duas sondas metálicas medem a resistência elétrica do solo. Quanto mais úmido, menor a resistência.',
  },
  {
    n: '02',
    title: 'ESP32',
    body: 'Lê o sinal analógico do sensor a cada intervalo, converte em porcentagem de umidade e conecta ao Wi‑Fi.',
  },
  {
    n: '03',
    title: 'Supabase',
    body: 'Recebe cada leitura por HTTPS e guarda em um banco de dados na nuvem, com histórico completo.',
  },
  {
    n: '04',
    title: 'Dashboard web',
    body: 'Busca os dados mais recentes e exibe em tempo real, com gráfico de histórico e previsão do tempo.',
  },
]

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-stone-950 text-stone-200">
      {/* Top bar */}
      <header className="border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5 sm:px-10">
          <img src="/soildash-logo.svg" alt="SoilDash" className="h-12 w-auto" />
          <Link
            href="/"
            className="text-sm text-stone-400 hover:text-green-500 transition-colors"
          >
            Ver dashboard
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 sm:px-10 pt-16 pb-20">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-stone-100 leading-[1.05]">
            Umidade do solo
            <br />
            medida em tempo real.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-stone-400 leading-relaxed">
            O <b className="text-green-500">SoilDash</b> lê a umidade do solo com um sensor HD-38 acoplado a um ESP32
            e envia cada leitura para um dashboard acessível pela web. <br />Projeto da
            FETIN 2026, apresentado no Inatel.
          </p>

          {/* Mock readout — o objeto mais característico do produto */}
          <div className="mt-10 inline-flex flex-col items-center gap-3 rounded-lg border border-stone-800 bg-stone-900/60 px-6 py-5">
            <div className="flex items-baseline gap-2">
              <span
                className="text-4xl text-green-500"
                style={{ fontFamily: 'var(--font-dm-mono)' }}
              >
                73.0%
              </span>
              <span className="text-sm text-stone-500">umidade</span>
            </div>
            <div className="h-1.5 w-56 overflow-hidden rounded-full bg-stone-800">
              <div className="h-full w-[73%] rounded-full bg-green-500" />
            </div>
            <div
              className="flex gap-4 text-xs text-stone-500"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              <span>ADC 2184</span>
              <span>RSSI -50 dBm</span>
            </div>
          </div>

          <div className="mt-10">
            <Link
              href="/"
              className="inline-block rounded-md bg-green-600 px-6 py-3 text-sm font-medium text-stone-950 hover:bg-green-500 transition-colors"
            >
              Ver dashboard ao vivo
            </Link>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="px-6 sm:px-10 py-16 border-t border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <h2 className="text-2xl font-bold text-stone-100 mb-10">Como funciona</h2>

          <div className="grid gap-8 sm:grid-cols-4 text-center">
            {pipeline.map((step, i) => (
              <div key={step.n} className="relative flex flex-col items-center">
                <span
                  className="block text-sm text-green-600 mb-2"
                  style={{ fontFamily: 'var(--font-dm-mono)' }}
                >
                  {step.n}
                </span>
                <h3 className="font-semibold text-stone-100 mb-2">{step.title}</h3>
                <p className="text-sm text-stone-400 leading-relaxed">{step.body}</p>
                {i < pipeline.length - 1 && (
                  <span className="hidden sm:block absolute top-1 -right-4 text-stone-700">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshot do dashboard */}
      <section className="px-6 sm:px-10 py-16 border-t border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <h2 className="text-2xl font-bold text-stone-100 mb-8">O dashboard</h2>
          <div className="w-full rounded-lg border border-stone-800 bg-stone-900 p-2">
            {/* 4 prints em public/, um por breakpoint. O navegador baixa só o que casar. */}
            <picture>
              <source
                type="image/webp"
                srcSet="
                        /dashboard-640.webp 640w,
                        /dashboard-1024.webp 1024w,
                        /dashboard-1536.webp 1536w,
                        /dashboard-1920.webp 1920w
                      "
                sizes="(min-width: 1024px) 1200px, 100vw"
              />
              <img
                srcSet="/dashboard-640.jpg 640w,
                        /dashboard-1024.jpg 1024w,
                        /dashboard-1536.jpg 1536w,
                        /dashboard-1920.jpg 1920w
                      "
    
                sizes="(min-width: 1024px) 1200px, 100vw"
                src="/dashboard-1024.jpg"
                alt="Tela do dashboard SoilDash mostrando umidade do solo em tempo real"
                width={1920}
                height={912}
                loading="lazy"
                className="w-full rounded"
              />
            </picture>
          </div>
        </div>
      </section>

      {/* Sobre o projeto */}
      <section className="px-6 sm:px-10 py-16 border-t border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold text-stone-100 mb-6">Sobre o projeto</h2>
          <div className="max-w-[60ch] text-stone-400 leading-relaxed space-y-4">
            <p>
              O SoilDash nasceu como projeto do FETIN 2026, a Feira Tecnológica do Inatel. A proposta é oferecer ao pequeno e médio produtor rural uma forma simples e acessível de acompanhar as condições do solo, desde uma pequena horta ou plantação até áreas maiores de cultivo, permitindo tomar decisões mais precisas sem precisar estar o tempo todo no campo.
            </p>
            <p>
              O hardware usa um ESP32 e um sensor resistivo HD-38, escolhidos pelo
              custo baixo e pela facilidade de reprodução. O firmware lê o sensor,
              envia os dados para o Supabase e o dashboard web consulta esses
              dados para exibir leituras atuais, histórico e previsão do tempo.
            </p>
            <p>Desenvolvido por Lucas, aluno de Engenharia da Computação no Inatel e Gustavo, aluno de Engenharia de Software no Inatel.</p>
          </div>
        </div>
      </section>

      <footer className="px-6 sm:px-10 py-10 border-t border-stone-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-stone-500">
          <span>SoilDash — FETIN 2026, Inatel</span>
          <Link href="/" className="hover:text-green-500 transition-colors">
            Ver dashboard
          </Link>
        </div>
      </footer>
    </main>
  )
}
