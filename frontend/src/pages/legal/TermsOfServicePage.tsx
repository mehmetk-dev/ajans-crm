import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
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
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Kullanım Şartları</h1>
          <p className="text-xs text-zinc-500 mb-10">Son Güncelleme: Haziran 2026</p>

          <div className="space-y-8 text-zinc-300 text-sm leading-relaxed text-left">
            <p>
              Bu Kullanım Şartları ("Sözleşme"), <code>crm.fogistanbul.com</code> platformu altında hizmet veren
              **FOG İstanbul Dijital Ajans** ("Platform Sahibi", "Biz", "Tarafımız") ile Platform'u kullanan gerçek
              veya tüzel kişi ("Kullanıcı", "Siz") arasında akdedilmiştir.
            </p>

            <hr className="border-white/10" />

            <section>
              <h2 className="text-xl font-bold text-white mb-4">2.1 Tanımlar</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-white/10 text-xs text-zinc-300">
                  <thead>
                    <tr className="bg-white/5 text-white">
                      <th className="border border-white/10 p-3 text-left font-bold">Terim</th>
                      <th className="border border-white/10 p-3 text-left font-bold">Tanım</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-white/10 p-3 font-semibold">Platform</td>
                      <td className="border border-white/10 p-3">FOG İstanbul Ajans CRM yazılımı, tüm modülleri ve entegrasyonları dahil SaaS hizmeti</td>
                    </tr>
                    <tr>
                      <td className="border border-white/10 p-3 font-semibold">Ajans</td>
                      <td className="border border-white/10 p-3">Platform'u kendi müşterilerine hizmet sunmak amacıyla kullanan dijital ajans (FOG İstanbul)</td>
                    </tr>
                    <tr>
                      <td className="border border-white/10 p-3 font-semibold">Müşteri / Marka</td>
                      <td className="border border-white/10 p-3">Ajansın hizmet sunduğu, Platform'da Client rolü ile temsil edilen şirket</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">2.2 Platform Kullanım Koşulları</h2>
              <p className="mb-2"><strong>2.2.1 Hesap Oluşturma:</strong></p>
              <ul className="list-disc list-inside space-y-1 pl-4 mb-4">
                <li>Platform hesapları yalnızca Ajans tarafından, Admin yetkisi ile oluşturulur.</li>
                <li>Kullanıcı, hesap bilgilerinin doğruluğundan ve gizliliğinden sorumludur.</li>
                <li>Her kullanıcı hesabı kişiye özeldir; başkalarıyla paylaşılamaz.</li>
              </ul>

              <p className="mb-2"><strong>2.2.2 Erişim Yetkileri:</strong></p>
              <ul className="list-disc list-inside space-y-1 pl-4 mb-4">
                <li>Platform'da üç rol seviyesi bulunur: ADMIN (sistem yöneticisi), AGENCY_STAFF (ajans çalışanı), COMPANY_USER (müşteri çalışanı).</li>
                <li>Kullanıcı, yalnızca kendisine tanımlanan yetkiler dahilinde Platform'u kullanabilir.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">2.3 Lisans ve Fikri Mülkiyet</h2>
              <p>
                Platform yazılımı, kaynak kodu, tasarımı, logosu, veritabanı yapısı ve tüm içeriği üzerindeki fikri
                mülkiyet hakları münhasıran Platform Sahibi'ne aittir. Kullanıcıya, yalnızca Platform'u kullanma amacıyla
                sınırlı, münhasır olmayan, devredilemez, alt lisans verilemez bir kullanım hakkı tanınır.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">2.4 Sorumluluk Sınırlandırması</h2>
              <p>
                Platform Sahibi, Platform'un kullanımından veya kullanılamamasından doğan doğrudan, dolaylı, arızi, özel
                veya sonuç olarak ortaya çıkan zararlardan (kar kaybı, iş kaybı, itibar kaybı, veri kaybı dahil) sorumlu değildir.
                Platform Sahibi, üçüncü taraf entegrasyonlarının (Google, Meta vb.) kesintisiz veya hatasız çalışacağını garanti etmez.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">2.5 Uygulanacak Hukuk ve Uyuşmazlık Çözümü</h2>
              <p>
                İşbu Sözleşme, Türkiye Cumhuriyeti yasalarına tabidir. Sözleşme'den doğan uyuşmazlıklarda **İstanbul
                (Çağlayan) Mahkemeleri ve İcra Daireleri** yetkilidir.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
