export function ApprovalSection() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-8 border-t border-white/[0.04]">

      <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="text-left">
          <p className="text-sm font-bold uppercase tracking-[0.36em] text-[#e84978]">Tek Tıkla Onay</p>
          <h2 className="mt-5 text-balance text-4xl font-bold tracking-[-0.04em] sm:text-5xl">Tartışma burada, onay son mesajda.</h2>
          <p className="mt-6 text-base leading-8 text-white/62">
            İçerik üzerine yapılan tüm yorumlar, açıklamalar ve revizyon istekleri tek bir dizi halinde toplanır. En alt mesajda tek tıkla onay veya yeni yorum seçenekleri belirir.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0a0a14] to-[#08080a] p-5">
          <div className="mb-4 flex items-center justify-between border-b border-white/8 pb-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#e84978] to-amber-300 text-sm font-black text-white">R</span>
              <div>
                <div className="text-sm font-bold text-white">Ürün lansman postu</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">3 katılımcı · 4 mesaj</div>
              </div>
            </div>
            <span className="rounded-full border border-[#e84978]/40 bg-[#e84978]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#ff9db8]">
              Onay bekliyor
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-end gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e84978] text-[10px] font-black text-white">F</span>
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.04] p-3">
                <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">FOG · 09:14</div>
                <p className="mt-1 text-xs text-zinc-200">Yeni sezon görseli hazır. Logonun pozisyonunu biraz değiştirdim, üst köşeye aldım.</p>
              </div>
            </div>
            <div className="flex items-end justify-end gap-2">
              <div className="max-w-[80%] rounded-2xl rounded-br-sm border border-[#e84978]/30 bg-[#e84978]/15 p-3">
                <div className="text-[9px] font-mono uppercase tracking-widest text-[#ff9db8]">Sen · 09:21</div>
                <p className="mt-1 text-xs text-white">Logoyu altta bırakalım, üstte daha ferah dursun. Bir de font biraz küçük.</p>
              </div>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-white text-[10px] font-black text-black">M</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e84978] text-[10px] font-black text-white">F</span>
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.04] p-3">
                <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">FOG · 09:28</div>
                <p className="mt-1 text-xs text-zinc-200">Anladım, logoyu alta aldım font da %15 büyüdü. Yeni versiyon hazır 👇</p>
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-300/30 bg-gradient-to-br from-emerald-300/10 to-emerald-300/0 p-3 backdrop-blur">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[9px] font-black uppercase tracking-widest text-emerald-300">KARAR ANI</span>
                <span className="text-[9px] font-mono text-zinc-500">şimdi</span>
              </div>
              <p className="text-xs text-white">Bu versiyonu yayına alalım mı?</p>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 rounded-lg bg-emerald-300/20 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-200 transition hover:bg-emerald-300/30">✓ Onayla</button>
                <button className="flex-1 rounded-lg border border-white/15 bg-white/5 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-300 transition hover:border-white/30 hover:text-white">↻ Son revizyon</button>
                <button className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-300 transition hover:border-white/30 hover:text-white">💬 Yorum</button>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 border-t border-white/8 pt-3">
            <input
              type="text"
              placeholder="Bir yorum yaz…"
              className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-[#e84978]/50"
            />
            <button className="rounded-lg bg-[#e84978] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#ff5b8a]">Gönder</button>
          </div>
        </div>
      </div>

    </section>
  );
}

