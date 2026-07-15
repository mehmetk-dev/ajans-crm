import { useState } from 'react';
import { services } from '../model/landingData';

export function ServicesSection() {
  const [splitActiveIndex, setSplitActiveIndex] = useState(0);

  return (
    <section id="ozellikler" className="relative z-10 py-24 bg-[#0A0A0C]/50 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-[#e84978] text-[11px] font-semibold uppercase tracking-wider">
            Çözümler
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Dijital İhtiyaçlarınız İçin 360° Çözümler</h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-[14px]">
            Tüm dijital süreçlerinizi bir araya toplayan FOG Müşteri Portalı modülleri ile ajans iş birliklerinizi üst seviyeye taşıyın.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left items-stretch">
          {/* Left Column: Typographic List of Services */}
          <div className="lg:col-span-5 flex flex-col justify-center divide-y divide-white/5 border-t border-b border-white/5">
            {services.map((service, index) => {
              const isActive = splitActiveIndex === index;
              return (
                <div
                  key={index}
                  onMouseEnter={() => setSplitActiveIndex(index)}
                  className={`py-4 transition-all duration-300 cursor-pointer flex items-center justify-between group ${
                    isActive ? 'pl-4' : 'pl-0'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <span className={`font-mono text-xs ${isActive ? 'text-[#e84978]' : 'text-zinc-600'}`}>
                      0{index + 1}
                    </span>
                    <h3 className={`text-md font-bold tracking-tight transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'
                    }`}>
                      {service.title}
                    </h3>
                  </div>

                  <span className={`h-1.5 w-1.5 rounded-full bg-[#e84978] transition-all duration-300 ${
                    isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                  }`} />
                </div>
              );
            })}
          </div>

          {/* Right Column: Cinematic Display Screen */}
          <div className="lg:col-span-7 rounded-[2.5rem] border border-white/[0.08] bg-[#121217]/40 backdrop-blur-xl p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl min-h-[350px]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-tr from-pink-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 text-[#e84978] shadow-lg animate-pulse">
                {(() => {
                  const Icon = services[splitActiveIndex].icon;
                  return <Icon className="w-7 h-7" />;
                })()}
              </div>

              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-widest text-[#e84978] font-bold font-mono">SEÇİLİ DETAY GÖRÜNÜMÜ</h4>
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white uppercase">
                  {services[splitActiveIndex].title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">
                  {services[splitActiveIndex].description}
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-6 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
              <span>FOG Premium Showcase</span>
              <span className="text-[#e84978]">Aksiyona Hazır</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

