import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Gizlilik Politikası</h1>
          <p className="text-xs text-zinc-500 mb-10">Son Güncelleme: Haziran 2026</p>

          <div className="space-y-8 text-zinc-300 text-sm leading-relaxed text-left">
            <p>
              Bu Gizlilik Politikası, FOG İstanbul ("Platform Sahibi", "Biz") tarafından işletilen ve{" "}
              <code>crm.fogistanbul.com</code> platformunun ("Platform"), kullanıcılarından ("Kullanıcı", "Siz") topladığı
              kişisel verilerin işlenmesine ilişkin esasları belirler.
            </p>

            <hr className="border-white/10" />

            <section>
              <h2 className="text-xl font-bold text-white mb-4">1.1 Veri Sorumlusu</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-white/10 text-xs text-zinc-300">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="border border-white/10 p-3 text-left font-bold text-white">Unsur</th>
                      <th className="border border-white/10 p-3 text-left font-bold text-white">Bilgi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-white/10 p-3 font-semibold">Veri Sorumlusu Unvanı</td>
                      <td className="border border-white/10 p-3">FOG İstanbul Dijital Ajans</td>
                    </tr>
                    <tr>
                      <td className="border border-white/10 p-3 font-semibold">Adres</td>
                      <td className="border border-white/10 p-3">Maslak, Büyükdere Cad. No:85, Sarıyer / İstanbul</td>
                    </tr>
                    <tr>
                      <td className="border border-white/10 p-3 font-semibold">E-posta</td>
                      <td className="border border-white/10 p-3">info@fogistanbul.com</td>
                    </tr>
                    <tr>
                      <td className="border border-white/10 p-3 font-semibold">Telefon</td>
                      <td className="border border-white/10 p-3">+90 (212) 000 00 00</td>
                    </tr>
                    <tr>
                      <td className="border border-white/10 p-3 font-semibold">Web Sitesi</td>
                      <td className="border border-white/10 p-3">crm.fogistanbul.com</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">1.2 Toplanan Kişisel Veriler</h2>
              <p className="mb-4">Platformumuz aracılığıyla aşağıdaki kişisel veri kategorileri toplanmaktadır:</p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-white/10 text-xs text-zinc-300">
                  <thead>
                    <tr className="bg-white/5 text-white font-bold">
                      <th className="border border-white/10 p-3 text-left">Veri Kategorisi</th>
                      <th className="border border-white/10 p-3 text-left">Toplanan Veriler</th>
                      <th className="border border-white/10 p-3 text-left">Toplanma Yöntemi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-white/10 p-3 font-semibold">Kimlik Bilgileri</td>
                      <td className="border border-white/10 p-3">Ad, soyad</td>
                      <td className="border border-white/10 p-3">Kayıt formu (Admin tarafından manuel oluşturma)</td>
                    </tr>
                    <tr>
                      <td className="border border-white/10 p-3 font-semibold">İletişim Bilgileri</td>
                      <td className="border border-white/10 p-3">E-posta adresi, telefon numarası</td>
                      <td className="border border-white/10 p-3">Kayıt formu, kullanıcı profili güncelleme</td>
                    </tr>
                    <tr>
                      <td className="border border-white/10 p-3 font-semibold">Mesleki Bilgiler</td>
                      <td className="border border-white/10 p-3">Şirket unvanı, pozisyon, departman</td>
                      <td className="border border-white/10 p-3">CRM kişi kaydı oluşturma</td>
                    </tr>
                    <tr>
                      <td className="border border-white/10 p-3 font-semibold">İşlem Verileri</td>
                      <td className="border border-white/10 p-3">Görev durumu, mesaj içerikleri, onay/revizyon kayıtları, dosya yüklemeleri, zaman takip kayıtları, görev puanlamaları</td>
                      <td className="border border-white/10 p-3">Platform kullanımı sırasında otomatik</td>
                    </tr>
                    <tr>
                      <td className="border border-white/10 p-3 font-semibold">Entegrasyon Verileri</td>
                      <td className="border border-white/10 p-3">Google Analytics mülk ID'leri, Google Ads müşteri ID'leri, Meta reklam hesabı ID'leri, Instagram hesap bilgileri, Search Console site URL'leri</td>
                      <td className="border border-white/10 p-3">OAuth entegrasyon kurulumu sırasında kullanıcı onayı ile</td>
                    </tr>
                    <tr>
                      <td className="border border-white/10 p-3 font-semibold">Teknik Veriler</td>
                      <td className="border border-white/10 p-3">IP adresi, tarayıcı tipi ve versiyonu, işletim sistemi, cihaz bilgileri, sayfa görüntüleme süreleri, tıklama akışları</td>
                      <td className="border border-white/10 p-3">Çerezler ve günlük kayıtları aracılığıyla otomatik</td>
                    </tr>
                    <tr>
                      <td className="border border-white/10 p-3 font-semibold">Çerez Verileri</td>
                      <td className="border border-white/10 p-3">Oturum çerezleri, tercih çerezleri, analitik çerezler, pazarlama çerezleri</td>
                      <td className="border border-white/10 p-3">Tarayıcı çerezleri</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">1.3 Verilerin İşlenme Amaçları</h2>
              <p className="mb-4">Toplanan kişisel veriler aşağıdaki amaçlarla işlenmektedir:</p>
              <ol className="list-decimal list-inside space-y-2 pl-4">
                <li><strong>Hizmet Sunumu:</strong> Platforma erişim sağlanması, kullanıcı hesabının yönetimi, görev ve proje takibi, mesajlaşma hizmetlerinin yürütülmesi, içerik onay akışlarının işletilmesi.</li>
                <li><strong>Entegrasyon Yönetimi:</strong> Google Analytics, Google Search Console, Google Ads, Meta Ads ve Instagram hesaplarının OAuth 2.0 ile bağlanması, bu hesaplardan analitik verilerin çekilmesi ve kullanıcıya raporlanması.</li>
                <li><strong>Müşteri İlişkileri Yönetimi:</strong> Ajans ile müşteri arasındaki iş akışının yönetilmesi, iletişim geçmişinin kaydı, memnuniyet anketlerinin iletilmesi.</li>
                <li><strong>Analiz ve İyileştirme:</strong> Platform kullanım istatistiklerinin analizi, hizmet kalitesinin artırılması, performans optimizasyonu.</li>
                <li><strong>Yasal Yükümlülükler:</strong> Yürürlükteki mevzuat gereği saklanması zorunlu kayıtların tutulması, yetkili makamlara bilgi verilmesi.</li>
                <li><strong>Pazarlama ve Remarketing (Onay Halinde):</strong> Google Ads ve Meta Ads remarketing kampanyaları, hedef kitle oluşturma, dönüşüm takibi.</li>
              </ol>
              <p className="mt-4 font-semibold text-white">Hukuki Sebepler:</p>
              <ul className="list-disc list-inside space-y-1 pl-4 mt-2">
                <li>Sözleşmenin ifası (GDPR Art. 6/1-b, KVKK 5/2-c): Platform hizmetinin sunulması</li>
                <li>Meşru menfaat (GDPR Art. 6/1-f, KVKK 5/2-f): Platform iyileştirme, analiz</li>
                <li>Açık rıza (GDPR Art. 6/1-a, KVKK 5/1): Pazarlama ve remarketing çerezleri, üçüncü taraf veri paylaşımı</li>
                <li>Hukuki yükümlülük (GDPR Art. 6/1-c, KVKK 5/2-ç, 5/2-e): Yasal saklama yükümlülükleri</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">1.4 Üçüncü Taraf Veri Paylaşımı ve Entegrasyonlar</h2>
              <p className="mb-4 font-semibold">Google Analytics (GA4)</p>
              <ul className="list-disc list-inside space-y-1 pl-4 mb-4">
                <li><strong>Sağlayıcı:</strong> Google LLC (1600 Amphitheatre Parkway, Mountain View, CA 94043, ABD)</li>
                <li><strong>İşlenen Veriler:</strong> IP adresi (anonimleştirilmiş), cihaz bilgileri, tarayıcı bilgileri, sayfa etkileşimleri, oturum verileri</li>
                <li><strong>Amaç:</strong> Platform kullanım analizi, kullanıcı davranışı raporlama</li>
                <li><strong>Hukuki Dayanak:</strong> Açık rıza (çerez onayı)</li>
              </ul>

              <p className="font-semibold">Meta Pixel (Facebook/Instagram)</p>
              <ul className="list-disc list-inside space-y-1 pl-4 mb-4">
                <li><strong>Sağlayıcı:</strong> Meta Platforms Ireland Ltd. (4 Grand Canal Square, Grand Canal Harbour, Dublin 2, İrlanda)</li>
                <li><strong>İşlenen Veriler:</strong> Sayfa görüntüleme, buton tıklamaları, form gönderimleri, dönüşüm olayları</li>
                <li><strong>Amaç:</strong> Dönüşüm takibi, remarketing/retargeting, reklam performans ölçümü</li>
                <li><strong>Hukuki Dayanak:</strong> Açık rıza (çerez onayı)</li>
              </ul>

              <p className="font-semibold">Google OAuth 2.0 Entegrasyonları</p>
              <ul className="list-disc list-inside space-y-1 pl-4 mb-4">
                <li><strong>Amaç:</strong> Google Analytics, Search Console ve Google Ads API'lerine güvenli erişim, müşteri raporlarının oluşturulması</li>
                <li><strong>Hukuki Dayanak:</strong> Kullanıcının Google hesabı üzerinden verdiği açık OAuth onayı</li>
                <li><strong>Not:</strong> Platform hiçbir zaman kullanıcının Google şifresini görmez veya saklamaz.</li>
              </ul>

              <p className="font-semibold">Google Ads API (Limited Use)</p>
              <p className="mb-3">Platformumuz, Google Ads API'ını yalnızca aşağıdaki sınırlı amaçlar için kullanmaktadır ve Google'ın <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-[#e84978] underline">API Hizmetleri Kullanıcı Verileri Politikası</a>'na (Limited Use Requirements) tam uyumluluk içindedir:</p>
              <ul className="list-disc list-inside space-y-1 pl-4 mb-4">
                <li><strong>Erişilen Veri Kapsamı:</strong> Google Ads hesaplarından yalnızca kampanya (campaigns), reklam grupları (ad groups), reklamlar (ads), anahtar kelimeler (keywords), dönüşüm verileri (conversions), hedef kitle sinyalleri (audience signals) ve harcama verileri (spend metrics) okunur. Reklam yaratma, düzenleme veya silme işlemi için yazma izni kesinlikle talep edilmez.</li>
                <li><strong>Veri Kullanım Amacı:</strong> Google Ads verileri yalnızca FOG Müşteri Portalı içinde müşteriye özel performans raporları oluşturmak, bütçe ve teklif önerileri sunmak, otomatik içerik zamanlama önerileri sağlamak ve ajans-müşteri şeffaflığını sağlamak amacıyla kullanılır.</li>
                <li><strong>Veri Aktarımı Yasağı:</strong> Google API'sinden elde edilen kullanıcı verileri, reklam/pazarlama ajansları, veri aracıları, üçüncü taraf hizmet sağlayıcılar veya başka herhangi bir dış tarafla paylaşılmaz, satılmaz veya devredilmez. Veriler yalnızca ilgili kullanıcının (müşteri/marka sahibi) kendi portal hesabında görüntülenir.</li>
                <li><strong>İnsan İncelemesi Yasağı:</strong> Platformumuz Google Ads verilerini kullanarak bireysel kullanıcıları tanımlayan, profillemeye yönelik veya kredi değerlendirmesi gibi amaçlara yönelik modeller oluşturmaz.</li>
                <li><strong>OAuth Erişiminin İptali:</strong> Kullanıcılar, Google hesap ayarları (myaccount.google.com/permissions) üzerinden FOG İstanbul'a verdikleri OAuth erişimini istedikleri zaman geri çekebilir. Erişim iptal edildiğinde, ilgili Google verileri 24 saat içinde senkronizasyondan çıkarılır ve silme talebi üzerine 30 gün içinde sistemden kaldırılır.</li>
                <li><strong>Minimum Kapsam İlkesi:</strong> Platform, OAuth sürecinde yalnızca hizmetin gerektirdiği minimum scope'ları (ör. <code>adwords.readonly</code>, <code>analytics.readonly</code>) talep eder. Yazma veya yönetim izinleri talep edilmez.</li>
                <li><strong>Saklama:</strong> Google Ads API'sinden çekilen veriler, müşteri panelinde ilgili rapor süresi boyunca (varsayılan 24 ay) saklanır. Müşteri silme talebinde 90 gün içinde tüm türetilmiş Google Ads verileri sistemden kalıcı olarak silinir.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">1.5 Veri Saklama Süreleri</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-white/10 text-xs text-zinc-300">
                  <thead>
                    <tr className="bg-white/5 text-white font-bold">
                      <th className="border border-white/10 p-3 text-left">Veri Kategorisi</th>
                      <th className="border border-white/10 p-3 text-left">Saklama Süresi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-white/10 p-3 font-semibold">Hesap Bilgileri</td>
                      <td className="border border-white/10 p-3">Hesap aktif olduğu sürece + hesap silindikten sonra 90 gün</td>
                    </tr>
                    <tr>
                      <td className="border border-white/10 p-3 font-semibold">Görev ve Proje Kayıtları</td>
                      <td className="border border-white/10 p-3">Sözleşme süresi + 10 yıl (yasal denetim ve uyuşmazlıklar için)</td>
                    </tr>
                    <tr>
                      <td className="border border-white/10 p-3 font-semibold">Aktivite Logları</td>
                      <td className="border border-white/10 p-3">3 yıl</td>
                    </tr>
                    <tr>
                      <td className="border border-white/10 p-3 font-semibold">Yedekleme Verileri</td>
                      <td className="border border-white/10 p-3">90 gün (döngüsel yedekleme)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">1.6 Kullanıcı Hakları (GDPR / KVKK)</h2>
              <p>Veri sahibi olarak aşağıdaki haklara sahipsiniz:</p>
              <ul className="list-disc list-inside space-y-1 pl-4 mt-2">
                <li>Erişim Hakkı: Hakkınızda hangi kişisel verilerin işlendiğini öğrenme</li>
                <li>Düzeltme Hakkı: Eksik veya yanlış verilerin düzeltilmesini talep etme</li>
                <li>Silme Hakkı ("Unutulma Hakkı"): Verilerinizin silinmesini talep etme</li>
                <li>Rızanın Geri Alınması: Verdiğiniz rızayı dilediğiniz zaman geri alma</li>
              </ul>
              <p className="mt-4">
                <strong>Başvuru Yöntemi:</strong> Haklarınızı kullanmak için <code>info@fogistanbul.com</code> adresine e-posta gönderebilirsiniz. Talebiniz en geç 30 gün içinde sonuçlandırılacaktır.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
