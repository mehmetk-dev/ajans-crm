import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function DataProcessingAgreementPage() {
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
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Veri İşleme Sözleşmesi (DPA)</h1>
          <p className="text-xs text-zinc-500 mb-10">Son Güncelleme: Haziran 2026</p>

          <div className="space-y-8 text-zinc-300 text-sm leading-relaxed text-left">
            <p>
              İşbu Veri İşleme Sözleşmesi ("DPA"), **Veri Sorumlusu** (CRM platformunu kullanan ajans/müşteri) ile
              **Veri İşleyen** (FOG İstanbul Dijital Ajans) arasında akdedilmiştir.
            </p>

            <hr className="border-white/10" />

            <section>
              <h2 className="text-xl font-bold text-white mb-4">4.1 Amaç ve Kapsam</h2>
              <p>
                İşbu DPA, Veri Sorumlusu'nun, FOG İstanbul Ajans CRM platformunu ("Platform") kullanması kapsamında Veri İşleyen
                tarafından gerçekleştirilecek kişisel veri işleme faaliyetlerine ilişkin tarafların hak ve yükümlülüklerini,
                **GDPR (Regulation EU 2016/679) Madde 28** ve **KVKK (6698 sayılı kanun) Madde 12** uyarınca düzenlemek amacıyla
                hazırlanmıştır.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">4.2 Roller ve Sorumluluklar</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-white/10 text-xs text-zinc-300">
                  <thead>
                    <tr className="bg-white/5 text-white">
                      <th className="border border-white/10 p-3 text-left font-bold">Unsur</th>
                      <th className="border border-white/10 p-3 text-left font-bold">Açıklama</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-white/10 p-3 font-semibold">Veri Sorumlusu</td>
                      <td className="border border-white/10 p-3">Müşterilerine ait kişisel verilerin Platform'da işlenmesi amacını ve yöntemini belirleyen taraftır.</td>
                    </tr>
                    <tr>
                      <td className="border border-white/10 p-3 font-semibold">Veri İşleyen</td>
                      <td className="border border-white/10 p-3">Platform Sahibi, Veri Sorumlusu'nun talimatları doğrultusunda, Platform'un teknik altyapısını sağlayarak verileri işler.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">4.3 Teknik ve İdari Tedbirler (TOMs)</h2>
              <p className="mb-4">Veri İşleyen, kişisel verilerin güvenliğini sağlamak için aşağıdaki önlemleri almaktadır:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li><strong>Erişim Kontrolü:</strong> Spring Security tabanlı Rol Tabanlı Yetkilendirme (RBAC) sistemi.</li>
                <li><strong>Şifreleme:</strong> Tüm veri iletimi TLS 1.3 (HTTPS) ile şifrelenir.</li>
                <li><strong>Kimlik Doğrulama:</strong> BCrypt ile şifrelenmiş parolalar ve HttpOnly Secure JWT çerezleri.</li>
                <li><strong>Alt İşleyen Denetimi:</strong> Google LLC ve Meta Platforms Ireland Ltd. gibi sağlayıcılarla güvenli veri koruma sözleşmeleri.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">4.4 Veri İade ve Silme</h2>
              <p>
                Sözleşmenin sona ermesini takip eden 30 gün içinde talep edilmesi halinde tüm veriler yapılandırılmış JSON/CSV formatında
                iade edilir. Fesih veya iade tamamlandıktan sonra 90 gün içinde platformdaki veriler geri döndürülemez şekilde silinir.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
