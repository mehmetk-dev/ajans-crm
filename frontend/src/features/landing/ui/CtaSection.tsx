interface CtaSectionProps {
  onPortalClick: () => void;
}

export function CtaSection({ onPortalClick }: CtaSectionProps) {
  return (
    <section className="relative z-10 py-16 max-w-7xl mx-auto px-6">
      <div className="relative rounded-3xl overflow-hidden p-8 md:p-16 text-center space-y-8 bg-gradient-to-r from-[#E24A75]/20 to-amber-600/10 border border-[#E24A75]/35 shadow-[0_0_50px_rgba(226,74,117,0.1)]">
        <div className="absolute inset-0 bg-[#0A0A0C]/40 mix-blend-overlay z-0" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Ajans Süreçlerinizi{' '}<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-amber-500">Birlikte Netleştirelim</span>
          </h2>
          <p className="text-zinc-300 text-sm leading-relaxed">
            İhtiyacınızı anlatın; doğru hizmet kapsamını ve portal akışını birlikte planlayalım. Mevcut müşteriler hesaplarına doğrudan giriş yapabilir.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button onClick={() => { const el = document.getElementById('iletisim'); el?.scrollIntoView({ behavior: 'smooth' }); }} className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-black hover:bg-[#E24A75] hover:text-white font-bold transition-all duration-300 shadow-xl active:scale-[0.98] text-[13px]">Projenizi Anlatın</button>
            <button onClick={onPortalClick} className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all duration-300 active:scale-[0.98] text-[13px]">Müşteri Girişi</button>
          </div>
        </div>
      </div>

    </section>
  );
}

