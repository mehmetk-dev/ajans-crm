import { motion } from 'framer-motion';
import { ArrowIcon } from './ArrowIcon';

interface HeroSectionProps {
  onPortalClick: () => void;
}

function DashboardPlane() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 top-16 overflow-hidden opacity-80 lg:top-0">
      <div className="dashboard-float absolute left-1/2 top-[48%] h-[58rem] w-[82rem] -translate-x-1/2 -translate-y-1/2 rotate-[-8deg] rounded-[4rem] border border-white/10 bg-[linear-gradient(115deg,rgba(255,255,255,.08),rgba(255,255,255,.01)_48%,rgba(232,73,120,.10))] shadow-[0_0_120px_rgba(232,73,120,.22)]" />
      <div className="dashboard-float-slow absolute left-1/2 top-[48%] grid w-[74rem] -translate-x-1/2 -translate-y-1/2 rotate-[-8deg] grid-cols-12 gap-5 opacity-95">
        <div className="col-span-7 h-64 rounded-[2rem] border border-white/10 bg-black/35 p-6 backdrop-blur-sm">
          <div className="mb-8 flex items-center justify-between text-white/50">
            <span className="h-2 w-28 rounded-full bg-white/20" />
            <span className="h-2 w-16 rounded-full bg-[#e84978]/70" />
          </div>
          <div className="grid h-40 grid-cols-8 items-end gap-3">
            {[42, 68, 54, 78, 61, 88, 74, 96].map((height) => (
              <span key={height} className="rounded-t-xl bg-gradient-to-t from-[#e84978]/60 to-white/50" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
        <div className="col-span-5 h-64 rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
          <div className="mb-8 h-2 w-36 rounded-full bg-white/20" />
          <div className="space-y-5">
            {["Bekliyor", "Devam Ediyor", "İncelemede", "Tamamlandı"].map((item, index) => (
              <div key={item} className="flex items-center gap-4 text-sm text-white/70">
                <span className={`h-3 w-3 rounded-full ${index === 3 ? "bg-[#e84978]" : "bg-white/25"}`} />
                <span className="w-28">{item}</span>
                <span className="h-2 flex-1 rounded-full bg-white/15" />
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-4 h-44 rounded-[2rem] border border-white/10 bg-black/25 p-6 backdrop-blur-sm">
          <div className="h-2 w-24 rounded-full bg-white/20" />
          <div className="mt-8 h-20 rounded-3xl border border-[#e84978]/30 bg-[#e84978]/15" />
        </div>
        <div className="col-span-4 h-44 rounded-[2rem] border border-white/10 bg-black/25 p-6 backdrop-blur-sm">
          <div className="h-2 w-28 rounded-full bg-white/20" />
          <div className="mt-7 space-y-3">
            <span className="block h-2 rounded-full bg-white/20" />
            <span className="block h-2 w-4/5 rounded-full bg-white/15" />
            <span className="block h-2 w-2/3 rounded-full bg-[#e84978]/50" />
          </div>
        </div>
        <div className="col-span-4 h-44 rounded-[2rem] border border-white/10 bg-black/25 p-6 backdrop-blur-sm">
          <div className="h-2 w-20 rounded-full bg-white/20" />
          <div className="mx-auto mt-4 h-24 w-24 rounded-full border-[12px] border-white/10 border-t-[#e84978]" />
        </div>
      </div>
    </div>
  );
}

export function HeroSection({ onPortalClick }: HeroSectionProps) {
  return (
    <section id="top" className="relative min-h-screen overflow-hidden pt-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(232,73,120,.45),transparent_28%),radial-gradient(circle_at_86%_18%,rgba(102,68,255,.16),transparent_28%),linear-gradient(180deg,rgba(7,5,10,.30),#07050a_92%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
      <DashboardPlane />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center justify-center px-6 py-24 text-center lg:px-8">
        <div className="hero-rise mx-auto max-w-5xl">
          <p className="mb-7 text-sm font-bold uppercase tracking-[0.62em] text-[#ff6e98]">FOG İstanbul</p>
          <h1 className="text-balance text-6xl font-black uppercase leading-[0.92] tracking-[-0.08em] sm:text-8xl lg:text-[9.5rem]">
            Müşteri Portalı
          </h1>
          <h2 className="mx-auto mt-7 max-w-4xl text-balance text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
            Ajansınızla Tek Panelde Çalışın.
          </h2>
          <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-white/68 sm:text-xl">
            Reklam kampanyalarınızı, sosyal medya performansınızı, içerik onaylarınızı ve web site sağlığınızı şeffaf, hızlı ve ölçülebilir biçimde tek ekrandan takip edin.
          </p>
          <div className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row mb-20">
            <a href="#nasil-calisir" className="group inline-flex min-w-56 items-center justify-center gap-3 rounded-2xl bg-[#e84978] px-7 py-4 font-bold text-white shadow-[0_0_45px_rgba(232,73,120,.38)] transition hover:-translate-y-1 hover:bg-[#ff5b8a]">
              Hemen Keşfedin <ArrowIcon className="h-5 w-5 transition group-hover:translate-x-1" />
            </a>
            <button 
              onClick={onPortalClick}
              className="inline-flex min-w-56 items-center justify-center rounded-2xl border border-white/16 bg-white/6 px-7 py-4 font-bold text-white backdrop-blur transition hover:-translate-y-1 hover:border-white/35 hover:bg-white/10 cursor-pointer"
            >
              Mevcut Müşteriyseniz Giriş Yap
            </button>
          </div>

          {/* CRM Panel Mockup - 3 Varyasyon */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative max-w-5xl mx-auto"
          >
            <div className="relative">
              <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl overflow-hidden shadow-2xl shadow-white/5">
                <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-500/80" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <span className="h-3 w-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="rounded-md bg-white/5 px-3 py-1 text-xs text-gray-500">
                    crm.fogistanbul.com
                  </div>
                  <div className="w-12" />
                </div>
                <div className="grid gap-3 p-5 md:grid-cols-12 text-left">
                  <div className="hidden space-y-2 rounded-lg border border-white/5 bg-white/[0.02] p-3 md:col-span-3 md:block">
                    {['Anasayfa', 'Görevler', 'İçerikler', 'Reklamlar', 'Sosyal Medya', 'Çekimler', 'Mesajlar', 'Raporlar'].map((item, i) => (
                      <div key={item} className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs ${i === 0 ? 'bg-white/10 text-white' : 'text-gray-400'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-gray-600'}`} />
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3 md:col-span-9">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-white">Hoş geldiniz, Acme Marka 👋</div>
                      <div className="flex gap-2">
                        <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-300">● Canlı</span>
                        <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] text-gray-400">Bu Hafta</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {[
                        { label: 'Tamamlanan', val: '47', tone: 'emerald' },
                        { label: 'Devam Eden', val: '12', tone: 'zinc' },
                        { label: 'Onay Bekleyen', val: '3', tone: 'amber' },
                        { label: 'ROAS', val: '4.8x', tone: 'sky' },
                      ].map((s) => (
                        <div key={s.label} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                          <div className="text-[10px] uppercase tracking-wider text-gray-500">{s.label}</div>
                          <div className="mt-1 text-xl font-bold text-white">{s.val}</div>
                          <div className="mt-1 text-[10px] text-zinc-500">▲ %12 bu hafta</div>
                        </div>
                      ))}
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="md:col-span-2 rounded-lg border border-white/5 bg-white/[0.02] p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-300">Haftalık İlerleme</span>
                          <span className="text-[10px] text-gray-500">Son 7 gün</span>
                        </div>
                        <div className="flex h-32 items-end justify-between gap-1.5">
                          {[35, 60, 45, 70, 50, 85, 95].map((h, i) => (
                            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-[#e84978]/30 to-[#e84978]" style={{ height: `${h}%` }} />
                          ))}
                        </div>
                      </div>
                      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                        <div className="mb-3 text-xs font-medium text-gray-300">İçerik Kuyruğu</div>
                        <div className="space-y-2">
                          {[
                            { t: 'Reel — Yaz Koleksiyonu', st: 'Onay Bekliyor', c: 'amber' },
                            { t: 'Story Seti — 5 Adet', st: 'Planlandı', c: 'sky' },
                            { t: 'Carousel — Yeni Ürün', st: 'Tamamlandı', c: 'emerald' },
                          ].map((q) => (
                            <div key={q.t} className="flex items-center justify-between text-[11px]">
                              <span className="truncate text-gray-300 text-xs">{q.t}</span>
                              <span className={`rounded px-1.5 py-0.5 text-[9px] ${
                                q.c === 'amber' ? 'bg-amber-500/10 text-amber-300' :
                                q.c === 'sky' ? 'bg-sky-500/10 text-sky-300' :
                                'bg-emerald-500/10 text-emerald-300'
                              }`}>{q.st}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-white/5 to-white/0 rounded-3xl blur-2xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

