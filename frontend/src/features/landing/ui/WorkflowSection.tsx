export function WorkflowSection() {
  return (
    <section id="nasil-calisir" className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 z-10 border-t border-white/[0.04]">
      <div className="absolute right-10 top-12 h-2 w-2 rounded-full bg-[#e84978] shadow-[0_0_30px_8px_rgba(232,73,120,.35)]" />
      <div className="max-w-3xl text-left">
        <p className="text-sm font-bold uppercase tracking-[0.36em] text-[#e84978]">Nasıl Çalışır?</p>
        <h2 className="mt-5 text-balance text-4xl font-bold tracking-[-0.04em] sm:text-6xl">Davet alın, giriş yapın, süreci canlı yönetin.</h2>
      </div>
      <div className="mt-16 grid gap-10 md:grid-cols-3 text-left">
        {[
          ["01", "Davet Alın", "Ajansınız size özel müşteri hesabınızı oluşturur ve güvenli davet bağlantınızı paylaşır."],
          ["02", "Giriş Yapın", "E-posta ve şifrenizle panelinize girer, markanızın hizmet kapsamını tek yerde görürsünüz."],
          ["03", "Yönetmeye Başlayın", "Görevleri takip eder, içerikleri onaylar, raporları görüntüler ve ekiple yazışırsınız."],
        ].map(([step, title, text]) => (
          <div key={step} className="group relative border-t border-white/14 pt-8">
            <span className="text-7xl font-black tracking-[-0.08em] text-white/8 transition group-hover:text-[#e84978]/25">{step}</span>
            <h3 className="mt-8 text-2xl font-bold">{title}</h3>
            <p className="mt-4 leading-7 text-white/58 text-sm">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

