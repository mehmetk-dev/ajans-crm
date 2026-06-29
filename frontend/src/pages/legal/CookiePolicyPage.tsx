import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#08080A] text-white font-sans antialiased selection:bg-pink-500/30">
      {/* Background ambience */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-pink-600/10 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-rose-700/5 blur-[140px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#08080A]/85 backdrop-blur-xl border-b border-white/5">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link to="/" className="text-2xl font-semibold tracking-tight">
            <span className="text-[#e84978]">FOG</span><span className="font-light text-white">istanbul</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" /> Ana Sayfa
          </Link>
        </nav>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-36 pb-24">
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-12 backdrop-blur">
          <p className="text-xs uppercase tracking-widest text-[#e84978] font-bold mb-3">Sözleşmeler & Politikalar</p>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Çerez Politikası</h1>
          <p className="text-xs text-zinc-500 mb-10">Son Güncelleme: Haziran 2026</p>

          <div className="space-y-8 text-zinc-300 text-sm leading-relaxed text-left">
            <p>
              Bu Çerez Politikası, FOG İstanbul Ajans CRM Platformu'nda (<code>crm.fogistanbul.com</code>) kullanılan
              çerezler ve benzeri izleme teknolojileri hakkında sizi bilgilendirmek amacıyla hazırlanmıştır.
            </p>

            <hr className="border-white/10" />

            <section>
              <h2 className="text-xl font-bold text-white mb-4">3.1 Çerez Nedir?</h2>
              <p>
                Çerez (cookie), bir web sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza (bilgisayar, tablet, telefon)
                kaydedilen küçük metin dosyalarıdır. Çerezler, web sitesinin sizi tanımasını, tercihlerinizi hatırlamasını ve size
                gelişmiş bir kullanım deneyimi sunmasını sağlar.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">3.2 Kullandığımız Çerez Türleri</h2>
              
              <h3 className="text-md font-bold text-white mb-2">3.2.1 Zorunlu Çerezler (Kesinlikle Gerekli)</h3>
              <p className="mb-4">
                Bu çerezler, Platform'un temel işlevlerini yerine getirebilmesi için teknik olarak zorunludur.
                Zorunlu çerezler için onay alınmaz.
              </p>

              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-white/10 text-xs text-zinc-300">
                  <thead>
                    <tr className="bg-white/5 text-white font-bold">
                      <th className="border border-white/10 p-3 text-left">Çerez Adı</th>
                      <th className="border border-white/10 p-3 text-left">Sağlayıcı</th>
                      <th className="border border-white/10 p-3 text-left">Amaç</th>
                      <th className="border border-white/10 p-3 text-left">Süre</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-white/10 p-3 font-semibold">`access_token`</td>
                      <td className="border border-white/10 p-3">FOG İstanbul (1. taraf)</td>
                      <td className="border border-white/10 p-3">JWT kimlik doğrulama; kullanıcının oturumunu yönetir</td>
                      <td className="border border-white/10 p-3">30 dakika</td>
                    </tr>
                    <tr>
                      <td className="border border-white/10 p-3 font-semibold">`cookie_consent`</td>
                      <td className="border border-white/10 p-3">FOG İstanbul (1. taraf)</td>
                      <td className="border border-white/10 p-3">Çerez tercihlerinizi kaydeder</td>
                      <td className="border border-white/10 p-3">12 ay</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-md font-bold text-white mb-2">3.2.2 Analitik Çerezler (Performans)</h3>
              <p className="mb-4">
                Bu çerezler, ziyaretçilerin Platform'u nasıl kullandığını anlamamıza yardımcı olur.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-white/10 text-xs text-zinc-300">
                  <thead>
                    <tr className="bg-white/5 text-white font-bold">
                      <th className="border border-white/10 p-3 text-left">Çerez Adı</th>
                      <th className="border border-white/10 p-3 text-left">Sağlayıcı</th>
                      <th className="border border-white/10 p-3 text-left">Amaç</th>
                      <th className="border border-white/10 p-3 text-left">Süre</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-white/10 p-3 font-semibold">`_ga`</td>
                      <td className="border border-white/10 p-3">Google LLC (3. taraf)</td>
                      <td className="border border-white/10 p-3">Kullanım analizi ve benzersiz kullanıcı tespiti</td>
                      <td className="border border-white/10 p-3">2 yıl</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">3.3 Çerez Tercihlerinizi Yönetme</h2>
              <p>
                Platform'u ilk ziyaret ettiğinizde, çerez tercihlerinizi yönetebileceğiniz bir çerez onay banner'ı görüntülenir.
                Ayrıca tarayıcı ayarlarınızdan çerezleri silebilir, engelleyebilir veya çerez gönderildiğinde uyarı alabilirsiniz.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
