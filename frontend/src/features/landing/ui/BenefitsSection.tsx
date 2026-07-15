export function BenefitsSection() {
  return (
    <section id="referanslar" className="relative z-10 py-24 bg-[#0A0A0C]/50 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-6">

        <>
          <div className="text-center space-y-4 mb-14">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Ajans İş Birliğinde Yeni Standart</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-[14px]">
              Portal, ajans ve marka arasındaki gündelik işleri tek bir güvenilir akışta buluşturur.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-6xl mx-auto">
            {[
              {
                name: "Şeffaf Performans",
                sector: "Raporlama · Analitik",
                tone: "from-pink-400 to-rose-500",
                metric: "Canlı veri",
                metricLabel: "Tek panelde",
                quote: "Google, Meta ve web performansınızı güncel veriler ve ajans yorumuyla birlikte izleyin.",
                person: "Ay sonunu beklemeden karar verin"
              },
              {
                name: "Hızlı Onay",
                sector: "İçerik · Revizyon",
                tone: "from-amber-400 to-orange-500",
                metric: "Tek akış",
                metricLabel: "Karar noktası",
                quote: "Hazırlanan içeriği inceleyin, yorumunuzu ekleyin ve sonucu doğrudan ilgili ekibe iletin.",
                person: "Dağınık e-posta zincirlerine son verin"
              },
              {
                name: "Ortak Hafıza",
                sector: "Görev · İletişim",
                tone: "from-emerald-400 to-teal-500",
                metric: "Tek kanal",
                metricLabel: "Eksiksiz geçmiş",
                quote: "Görevler, mesajlar, dosyalar ve teslim tarihleri ekip değişse bile kaybolmadan aynı yerde kalır.",
                person: "Herkes aynı güncel bilgiyle çalışır"
              }
            ].map((story) => (
              <div key={story.name} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-6 transition-all hover:border-[#e84978]/30">
                <div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${story.tone} opacity-20 blur-2xl`} />
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${story.tone} text-base font-black text-white`}>
                      {story.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-base font-black text-white">{story.name}</div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{story.sector}</div>
                    </div>
                  </div>
                  <div className="my-4">
                    <div className={`text-3xl font-black bg-gradient-to-r ${story.tone} bg-clip-text text-transparent`}>{story.metric}</div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{story.metricLabel}</div>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed italic">"{story.quote}"</p>
                  <div className="mt-4 border-t border-white/8 pt-3 text-[10px] text-zinc-500">{story.person}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      </div>
    </section>
  );
}

