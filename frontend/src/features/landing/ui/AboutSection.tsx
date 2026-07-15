import { useState } from 'react';
import { motion } from 'framer-motion';

export function AboutSection() {
  const [aboutTimelineStep, setAboutTimelineStep] = useState(0);

  return (
    <section id="hakkimizda" className="relative z-10 py-24 md:py-32 border-t border-white/[0.04] bg-[#0A0A0C]/50">
      <div className="max-w-7xl mx-auto px-6 text-center">
        
        <div className="mx-auto max-w-6xl text-left">
          <div className="relative overflow-hidden border border-white/10 bg-gradient-to-br from-[#08080c] via-[#0a0a12] to-[#08080a] p-6 md:p-12">
            {/* Arka plan parıltı */}
            <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[120%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(232,73,120,.18),transparent_60%)]" />
            <div className="pointer-events-none absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-amber-300/8 blur-[120px]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_center,#fff_1px,transparent_1px)] [background-size:24px_24px]" />

            <div className="relative grid gap-10 lg:grid-cols-[0.38fr_0.62fr]">
              <div className="flex flex-col justify-center">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.36em] text-[#e84978]">
                  Liquid timeline / 04 stages
                </span>
                <h2 className="mt-6 text-4xl font-black leading-[0.92] tracking-tight text-white md:text-6xl">
                  Brief'ten rapora
                  <br />
                  <span className="bg-gradient-to-r from-[#ff6e98] via-amber-200 to-white bg-clip-text text-transparent">
                    akan tek süreç.
                  </span>
                </h2>
                <p className="mt-6 max-w-md text-sm leading-7 text-zinc-400">
                  FOG İstanbul iş akışını bir nehir gibi görünür kılar. Her damla, ajansınızın ürettiği işin bir anını temsil eder; siz de müşteri olarak o nehrin kıyısında, hangi aşamada olduğunuzu canlı izlersiniz.
                </p>
                <div className="mt-8 flex items-center gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">Akış</span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-8 rounded-full bg-white/15"
                        animate={{ backgroundColor: ['rgba(255,255,255,0.15)', 'rgba(232,73,120,1)', 'rgba(255,255,255,0.15)'] }}
                        transition={{ duration: 2, delay: i * 0.25, repeat: Infinity }}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">Devam Ediyor</span>
                </div>
              </div>

              <div className="relative">
                {/* Dalga SVG'si */}
                <div className="relative h-44 md:h-56">
                  <svg viewBox="0 0 600 200" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="flowGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#e84978" stopOpacity="0.1" />
                        <stop offset="35%" stopColor="#e84978" stopOpacity="1" />
                        <stop offset="65%" stopColor="#fcd34d" stopOpacity="1" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Arka dalga */}
                    <motion.path
                      d="M 0 100 Q 75 60 150 100 T 300 100 T 450 100 T 600 100"
                      fill="none"
                      stroke="rgba(232,73,120,0.18)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      animate={{ d: [
                        "M 0 100 Q 75 60 150 100 T 300 100 T 450 100 T 600 100",
                        "M 0 100 Q 75 140 150 100 T 300 100 T 450 100 T 600 100",
                        "M 0 100 Q 75 60 150 100 T 300 100 T 450 100 T 600 100"
                      ] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Ana akış çizgisi */}
                    <motion.path
                      d="M 0 100 Q 75 60 150 100 T 300 100 T 450 100 T 600 100"
                      fill="none"
                      stroke="url(#flowGrad)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      filter="url(#glow)"
                      strokeDasharray="600"
                      initial={{ strokeDashoffset: 600 }}
                      animate={{ strokeDashoffset: 0 }}
                      transition={{ duration: 2.5, ease: "easeOut" }}
                    />

                    {/* Aktif parçacık */}
                    <motion.circle
                      r="6"
                      fill="#fff"
                      filter="url(#glow)"
                      initial={{ offsetDistance: "0%" }}
                      animate={{ offsetDistance: "100%" }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      style={{ offsetPath: "path('M 0 100 Q 75 60 150 100 T 300 100 T 450 100 T 600 100')" }}
                    />
                  </svg>

                  {/* 4 düğüm noktası */}
                  {[
                    { left: "8%", label: "01" },
                    { left: "36%", label: "02" },
                    { left: "64%", label: "03" },
                    { left: "92%", label: "04" }
                  ].map((node, idx) => (
                    <div
                      key={idx}
                      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: node.left }}
                    >
                      <div className="relative">
                        <span className="absolute inset-0 -m-2 rounded-full bg-[#e84978]/30 blur-md animate-pulse" />
                        <span className="absolute inset-0 -m-1 rounded-full border border-[#e84978]/60 animate-ping" />
                        <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-[#e84978] text-[9px] font-black text-white shadow-[0_0_20px_rgba(232,73,120,.6)]">
                          {node.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 4 Adım Kartı */}
                <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    { num: "01", title: "Brief", desc: "Hedef ve kapsam netleşir.", tone: "from-[#e84978]/20 to-transparent" },
                    { num: "02", title: "Üretim", desc: "Tasarım ve içerik işler.", tone: "from-[#e84978]/15 to-amber-300/10" },
                    { num: "03", title: "Onay", desc: "Kararlar portalda toplanır.", tone: "from-amber-300/15 to-amber-300/0" },
                    { num: "04", title: "Rapor", desc: "Sonuçlar okunur, rota çıkar.", tone: "from-white/10 to-transparent" }
                  ].map((step, idx) => {
                    const isActive = aboutTimelineStep === idx;
                    return (
                      <button
                        key={step.num}
                        type="button"
                        onClick={() => setAboutTimelineStep(idx)}
                        className={`group relative overflow-hidden border bg-gradient-to-b p-4 text-left backdrop-blur transition-all duration-500 ${
                          isActive
                            ? "border-[#e84978] from-white/[0.05] to-white/[0.01] shadow-[0_0_30px_rgba(232,73,120,.18)]"
                            : "border-white/8 from-white/[0.03] to-white/[0.005] hover:border-[#e84978]/40"
                        }`}
                      >
                        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${step.tone} ${isActive ? "opacity-100" : "opacity-60"}`} />
                        <div className="relative">
                          <span className="font-mono text-[9px] font-black text-[#e84978]">{step.num}</span>
                          <h4 className={`mt-3 text-sm font-black transition-colors ${isActive ? "text-white" : "text-zinc-200"}`}>{step.title}</h4>
                          <p className="mt-2 text-[10px] leading-4 text-zinc-500">{step.desc}</p>
                        </div>
                        <span
                          className={`absolute bottom-2 right-2 h-1.5 w-1.5 rounded-full bg-[#e84978] transition-all ${
                            isActive ? "opacity-100 shadow-[0_0_10px_rgba(232,73,120,1)]" : "opacity-0 group-hover:opacity-100"
                          }`}
                        />
                        {isActive && (
                          <span className="absolute -top-px left-2 right-2 h-px bg-gradient-to-r from-transparent via-[#e84978] to-transparent" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

