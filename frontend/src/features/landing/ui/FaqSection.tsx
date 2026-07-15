import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

const faqs = [
  {
    q: "Bu panel için ek ücret ödeyecek miyim?",
    a: "Hayır. Müşteri portalı, FOG İstanbul ile çalışan tüm markalarımıza ve partnerlerimize tamamen ücretsiz sunulur."
  },
  {
    q: "Verilerim güvende mi?",
    a: "Tüm verileriniz SSL şifreleme ile korunur. Google ve Meta entegrasyonları resmi API ve OAuth 2.0 üzerinden yapılır; şifreleriniz hiçbir şekilde kaydedilmez. Altyapımız GDPR ve KVKK ile tam uyumludur."
  },
  {
    q: "Mobil cihazlardan erişebilir miyim?",
    a: "Evet. FOG Müşteri Portalı tamamen responsive (mobil uyumlu) bir tasarıma sahiptir; telefon, tablet ve masaüstünden rahatlıkla erişim sağlayabilirsiniz."
  },
  {
    q: "Birden fazla çalışanım panelle erişebilir mi?",
    a: "Evet. Şirket sahibi/yöneticisi olarak çalışanlarınıza farklı yetki seviyelerinde alt kullanıcı hesapları tanımlayabilirsiniz."
  },
  {
    q: "Panelde hangi verileri görebilirim?",
    a: "Aktif hizmet paketinize bağlı olarak Google Analytics, Search Console, Google Ads, Meta Ads, Instagram analizleri, PageSpeed skorları, içerik planları, çekim takvimi ve görevlerinizi görebilirsiniz."
  }
];

export function FaqSection() {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  return (
    <section id="sss" className="relative z-10 py-24 max-w-7xl mx-auto px-6 border-t border-white/[0.04]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-[#E24A75] text-[11px] font-semibold uppercase tracking-wider">Yardım</div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Sıkça Sorulan Sorular</h2>
          <p className="text-zinc-400 text-sm">FOG İstanbul Müşteri Portalı ve ajans iş akışı hakkında en çok merak edilenler.</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeFAQ === index;
            return (
              <div key={index} className="border-b border-white/[0.05] pb-4">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveFAQ(isOpen ? null : index); }}
                  className="w-full py-4 flex items-center justify-between text-left group focus:outline-none select-none"
                >
                  <span className="font-semibold text-sm md:text-base text-zinc-100 group-hover:text-white transition-colors">{faq.q}</span>
                  {isOpen ? <Minus className="w-4 h-4 text-[#E24A75] shrink-0 ml-4" /> : <Plus className="w-4 h-4 text-zinc-500 group-hover:text-[#E24A75] shrink-0 ml-4" />}
                </button>
                <div className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-250 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="min-h-0">
                    <p className="pb-4 pt-1 text-zinc-400 text-xs md:text-sm leading-relaxed pr-8">{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}

