import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Minus, 
  BarChart3, 
  Instagram, 
  Globe, 
  Megaphone, 
  Calendar, 
  MessageSquare, 
  Video, 
  Database,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight
} from 'lucide-react';

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

function DashboardPlane() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 top-16 overflow-hidden opacity-80 lg:top-0">
      <div className="dashboard-float absolute left-1/2 top-[48%] h-[58rem] w-[82rem] -translate-x-1/2 -translate-y-1/2 rotate-[-8deg] rounded-[4rem] border border-white/10 bg-[linear-gradient(115deg,rgba(255,255,255,.08),rgba(255,255,255,.01)_48%,rgba(232,73,120,.10))] shadow-[0_0_120px_rgba(232,73,120,.22)]" />
      <div className="dashboard-float-slow absolute left-1/2 top-[48%] grid w-[74rem] -translate-x-1/2 -translate-y-1/2 rotate-[-8deg] grid-cols-12 gap-5 opacity-95">
        <div className="col-span-7 h-64 rounded-[2rem] border border-white/10 bg-black/35 p-6 backdrop-blur-sm">
          <div className="mb-8 flex items-center justify-between text-white/50">
            <span className="h-2 w-28 rounded-full bg-white/20" />
            <span className="h-2 w-16 rounded-full bg-[#e84978]/70" />
          </div>
          <div className="grid h-40 grid-cols-8 items-end gap-3">
            {[42, 68, 54, 78, 61, 88, 74, 96].map((height) => (
              <span key={height} className="rounded-t-xl bg-gradient-to-t from-[#e84978]/60 to-white/50" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
        <div className="col-span-5 h-64 rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
          <div className="mb-8 h-2 w-36 rounded-full bg-white/20" />
          <div className="space-y-5">
            {["Bekliyor", "Devam Ediyor", "İncelemede", "Tamamlandı"].map((item, index) => (
              <div key={item} className="flex items-center gap-4 text-sm text-white/70">
                <span className={`h-3 w-3 rounded-full ${index === 3 ? "bg-[#e84978]" : "bg-white/25"}`} />
                <span className="w-28">{item}</span>
                <span className="h-2 flex-1 rounded-full bg-white/15" />
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-4 h-44 rounded-[2rem] border border-white/10 bg-black/25 p-6 backdrop-blur-sm">
          <div className="h-2 w-24 rounded-full bg-white/20" />
          <div className="mt-8 h-20 rounded-3xl border border-[#e84978]/30 bg-[#e84978]/15" />
        </div>
        <div className="col-span-4 h-44 rounded-[2rem] border border-white/10 bg-black/25 p-6 backdrop-blur-sm">
          <div className="h-2 w-28 rounded-full bg-white/20" />
          <div className="mt-7 space-y-3">
            <span className="block h-2 rounded-full bg-white/20" />
            <span className="block h-2 w-4/5 rounded-full bg-white/15" />
            <span className="block h-2 w-2/3 rounded-full bg-[#e84978]/50" />
          </div>
        </div>
        <div className="col-span-4 h-44 rounded-[2rem] border border-white/10 bg-black/25 p-6 backdrop-blur-sm">
          <div className="h-2 w-20 rounded-full bg-white/20" />
          <div className="mx-auto mt-4 h-24 w-24 rounded-full border-[12px] border-white/10 border-t-[#e84978]" />
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [selectedServiceStyle, setSelectedServiceStyle] = useState(1);
  const [radarActiveIndex, setRadarActiveIndex] = useState(0);
  const [splitActiveIndex, setSplitActiveIndex] = useState(0);
  const [selectedAboutStyle, setSelectedAboutStyle] = useState(1);
  const [aboutTimelineStep, setAboutTimelineStep] = useState(0);
  const [selectedApprovalStyle, setSelectedApprovalStyle] = useState(1);
  const [selectedHeroPanelStyle, setSelectedHeroPanelStyle] = useState(1);
  const [selectedBrandStyle, setSelectedBrandStyle] = useState(1);
  const [selectedFAQStyle, setSelectedFAQStyle] = useState(1);
  const [selectedCTAStyle, setSelectedCTAStyle] = useState(1);

  const services = [
    {
      icon: BarChart3,
      title: "Dijital Pazarlama",
      description: "Google Analytics ve Search Console verilerinizi ajansınızın yorumuyla birlikte tek panelde görün."
    },
    {
      icon: Instagram,
      title: "Sosyal Medya",
      description: "Instagram hesabınızın büyümesini ve son paylaşımlarınızın performansını verilerle canlı izleyin."
    },
    {
      icon: Globe,
      title: "Web Tasarım",
      description: "Mobil ve masaüstü PageSpeed performans skorlarınızı ve web sitenizin güncel durumunu takip edin."
    },
    {
      icon: Megaphone,
      title: "Reklam Yönetimi",
      description: "Google ve Meta Ads reklam bütçelerinizin nereye harcandığını ve ROAS değerlerinizi şeffafça görün."
    },
    {
      icon: Calendar,
      title: "İçerik Pazarlama",
      description: "İçerik onay süreçlerinizi e-posta trafiğinden kurtarın. Panelden tek tıkla onaylayın veya revizyon isteyin."
    },
    {
      icon: MessageSquare,
      title: "Görev Yönetimi",
      description: "Ajansınızın sizin için yaptığı tüm işlerin durumunu canlı (Bekliyor, Devam Ediyor, Tamamlandı) izleyin."
    },
    {
      icon: Video,
      title: "Çekim & Prodüksiyon",
      description: "Prodüksiyon süreçlerinizde sürpriz olmasın. Çekim takviminizi, ekip ve lokasyon detaylarını görün."
    },
    {
      icon: Database,
      title: "Doğrudan İletişim",
      description: "WhatsApp karmaşasına son verin. Ajans ekibinizle doğrudan panel içinden mesajlaşın."
    }
  ];

  useEffect(() => {
    if (selectedServiceStyle !== 4) return;
    const interval = setInterval(() => {
      setRadarActiveIndex((prev) => (prev + 1) % services.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [selectedServiceStyle, services.length]);


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

  const handlePortalRedirect = () => {
    navigate('/dashboard');
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#08080A] text-white overflow-hidden font-sans select-none">
      {/* Background Decorative Gradients & Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-[20%] w-[800px] h-[800px] bg-pink-500/5 rounded-full blur-[140px]" />
        <div className="absolute top-[30%] right-[10%] w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[800px] h-[800px] bg-pink-500/5 rounded-full blur-[150px]" />
        
        {/* Fine grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 90%)'
          }}
        />
      </div>

      {/* Navigation */}
      <div className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#07050a]/70 backdrop-blur-xl">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <a href="#top" className="text-2xl font-semibold tracking-tight" aria-label="FOG İstanbul ana sayfa">
            <span className="text-[#e84978]">FOG</span><span className="font-light">istanbul</span>
          </a>
          
          {/* Desktop Menu */}
          <div className="hidden items-center gap-9 text-sm font-medium text-white/62 md:flex">
            <button onClick={() => scrollTo("nasil-calisir")} className="transition hover:text-white cursor-pointer">Nasıl Çalışır?</button>
            <button onClick={() => scrollTo("ozellikler")} className="transition hover:text-white cursor-pointer">Özellikler</button>
            <button onClick={() => scrollTo("referanslar")} className="transition hover:text-white cursor-pointer">Referanslar</button>
            <button onClick={() => scrollTo("sss")} className="transition hover:text-white cursor-pointer">SSS</button>
            <button
              onClick={() => scrollTo("iletisim")}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e84978]/40 bg-[#e84978]/10 px-3 py-1 text-xs font-bold text-[#ff9db8] transition hover:border-[#e84978] hover:bg-[#e84978]/20 hover:text-white cursor-pointer"
            >
              <span>İletişim</span>
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1.05.37 2.07.7 3.05a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l2.03-1.27a2 2 0 0 1 2.11-.45c.98.33 2 .57 3.05.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </button>
          </div>
          
          {/* Desktop CTA */}
          <div className="hidden md:flex items-center">
            <button 
              onClick={handlePortalRedirect}
              className="group inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#07050a] transition hover:bg-[#e84978] hover:text-white cursor-pointer"
            >
              {user ? "Müşteri Portalı" : "Giriş Yap"} <ArrowIcon className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-[#e84978] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Dropdown Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute top-20 left-0 w-full bg-[#07050a]/95 border-b border-white/[0.08] backdrop-blur-xl md:hidden overflow-hidden"
            >
              <div className="px-6 py-8 flex flex-col gap-6 text-sm font-medium text-left">
                <button onClick={() => { setMobileMenuOpen(false); scrollTo("nasil-calisir"); }} className="text-zinc-400 hover:text-white transition-colors text-left cursor-pointer">Nasıl Çalışır?</button>
                <button onClick={() => { setMobileMenuOpen(false); scrollTo("ozellikler"); }} className="text-zinc-400 hover:text-white transition-colors text-left cursor-pointer">Özellikler</button>
                <button onClick={() => { setMobileMenuOpen(false); scrollTo("referanslar"); }} className="text-zinc-400 hover:text-white transition-colors text-left cursor-pointer">Referanslar</button>
                <button onClick={() => { setMobileMenuOpen(false); scrollTo("sss"); }} className="text-zinc-400 hover:text-white transition-colors text-left cursor-pointer">SSS</button>
                <button onClick={() => { setMobileMenuOpen(false); scrollTo("iletisim"); }} className="text-zinc-400 hover:text-white transition-colors text-left cursor-pointer">İletişim</button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handlePortalRedirect();
                  }}
                  className="w-full py-3 rounded-xl bg-white text-[#07050a] hover:bg-[#e84978] hover:text-white font-semibold text-center transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {user ? "Müşteri Portalı" : "Giriş Yap"}
                  <ArrowIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* HERO SECTION */}
      <section id="top" className="relative min-h-screen overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(232,73,120,.45),transparent_28%),radial-gradient(circle_at_86%_18%,rgba(102,68,255,.16),transparent_28%),linear-gradient(180deg,rgba(7,5,10,.30),#07050a_92%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
        <DashboardPlane />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center justify-center px-6 py-24 text-center lg:px-8">
          <div className="hero-rise mx-auto max-w-5xl">
            <p className="mb-7 text-sm font-bold uppercase tracking-[0.62em] text-[#ff6e98]">FOG İstanbul</p>
            <h1 className="text-balance text-6xl font-black uppercase leading-[0.92] tracking-[-0.08em] sm:text-8xl lg:text-[9.5rem]">
              Müşteri Portalı
            </h1>
            <h2 className="mx-auto mt-7 max-w-4xl text-balance text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              Ajansınızla Tek Panelde Çalışın.
            </h2>
            <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-white/68 sm:text-xl">
              Reklam kampanyalarınızı, sosyal medya performansınızı, içerik onaylarınızı ve web site sağlığınızı şeffaf, hızlı ve ölçülebilir biçimde tek ekrandan takip edin.
            </p>
            <div className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row mb-20">
              <a href="#nasil-calisir" className="group inline-flex min-w-56 items-center justify-center gap-3 rounded-2xl bg-[#e84978] px-7 py-4 font-bold text-white shadow-[0_0_45px_rgba(232,73,120,.38)] transition hover:-translate-y-1 hover:bg-[#ff5b8a]">
                Hemen Keşfedin <ArrowIcon className="h-5 w-5 transition group-hover:translate-x-1" />
              </a>
              <button 
                onClick={handlePortalRedirect}
                className="inline-flex min-w-56 items-center justify-center rounded-2xl border border-white/16 bg-white/6 px-7 py-4 font-bold text-white backdrop-blur transition hover:-translate-y-1 hover:border-white/35 hover:bg-white/10 cursor-pointer"
              >
                Mevcut Müşteriyseniz Giriş Yap
              </button>
            </div>

            {/* CRM Panel Mockup - 3 Varyasyon */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="relative max-w-5xl mx-auto"
            >
              {/* Switcher */}
              <div className="mb-4 flex justify-center">
                <div className="flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-black/30 p-1 backdrop-blur">
                  {[
                    { n: 1, label: "1. Standart Panel" },
                    { n: 2, label: "2. Marka Analitiği" },
                    { n: 3, label: "3. Takvim Operasyonları" },
                    { n: 4, label: "4. Müşteri Portföyü" }
                  ].map((s) => (
                    <button
                      key={s.n}
                      type="button"
                      onClick={() => setSelectedHeroPanelStyle(s.n)}
                      className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
                        selectedHeroPanelStyle === s.n
                          ? "bg-[#e84978] text-white"
                          : "text-zinc-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* VARYASYON 1: Masaüstü Tarayıcı Dashboard */}
              {selectedHeroPanelStyle === 1 && (
                <div className="relative">
                  <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl overflow-hidden shadow-2xl shadow-white/5">
                    <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-red-500/80" />
                        <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                        <span className="h-3 w-3 rounded-full bg-green-500/80" />
                      </div>
                      <div className="rounded-md bg-white/5 px-3 py-1 text-xs text-gray-500">
                        crm.fogistanbul.com
                      </div>
                      <div className="w-12" />
                    </div>
                    <div className="grid gap-3 p-5 md:grid-cols-12 text-left">
                      <div className="hidden space-y-2 rounded-lg border border-white/5 bg-white/[0.02] p-3 md:col-span-3 md:block">
                        {['Anasayfa', 'Görevler', 'İçerikler', 'Reklamlar', 'Sosyal Medya', 'Çekimler', 'Mesajlar', 'Raporlar'].map((item, i) => (
                          <div key={item} className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs ${i === 0 ? 'bg-white/10 text-white' : 'text-gray-400'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-gray-600'}`} />
                            {item}
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3 md:col-span-9">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-white">Hoş geldiniz, Acme Marka 👋</div>
                          <div className="flex gap-2">
                            <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-300">● Canlı</span>
                            <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] text-gray-400">Bu Hafta</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                          {[
                            { label: 'Tamamlanan', val: '47', tone: 'emerald' },
                            { label: 'Devam Eden', val: '12', tone: 'zinc' },
                            { label: 'Onay Bekleyen', val: '3', tone: 'amber' },
                            { label: 'ROAS', val: '4.8x', tone: 'sky' },
                          ].map((s) => (
                            <div key={s.label} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                              <div className="text-[10px] uppercase tracking-wider text-gray-500">{s.label}</div>
                              <div className="mt-1 text-xl font-bold text-white">{s.val}</div>
                              <div className="mt-1 text-[10px] text-zinc-500">▲ %12 bu hafta</div>
                            </div>
                          ))}
                        </div>
                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="md:col-span-2 rounded-lg border border-white/5 bg-white/[0.02] p-4">
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-300">Haftalık İlerleme</span>
                              <span className="text-[10px] text-gray-500">Son 7 gün</span>
                            </div>
                            <div className="flex h-32 items-end justify-between gap-1.5">
                              {[35, 60, 45, 70, 50, 85, 95].map((h, i) => (
                                <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-[#e84978]/30 to-[#e84978]" style={{ height: `${h}%` }} />
                              ))}
                            </div>
                          </div>
                          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                            <div className="mb-3 text-xs font-medium text-gray-300">İçerik Kuyruğu</div>
                            <div className="space-y-2">
                              {[
                                { t: 'Reel — Yaz Koleksiyonu', st: 'Onay Bekliyor', c: 'amber' },
                                { t: 'Story Seti — 5 Adet', st: 'Planlandı', c: 'sky' },
                                { t: 'Carousel — Yeni Ürün', st: 'Tamamlandı', c: 'emerald' },
                              ].map((q) => (
                                <div key={q.t} className="flex items-center justify-between text-[11px]">
                                  <span className="truncate text-gray-300 text-xs">{q.t}</span>
                                  <span className={`rounded px-1.5 py-0.5 text-[9px] ${
                                    q.c === 'amber' ? 'bg-amber-500/10 text-amber-300' :
                                    q.c === 'sky' ? 'bg-sky-500/10 text-sky-300' :
                                    'bg-emerald-500/10 text-emerald-300'
                                  }`}>{q.st}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VARYASYON 2: Marka Analitiği (Deep Analytics) */}
              {selectedHeroPanelStyle === 2 && (
                <div className="relative">
                  <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl overflow-hidden shadow-2xl shadow-white/5">
                    <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-red-500/80" />
                        <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                        <span className="h-3 w-3 rounded-full bg-green-500/80" />
                      </div>
                      <div className="rounded-md bg-white/5 px-3 py-1 text-xs text-gray-500">
                        analitik.fogistanbul.com
                      </div>
                      <div className="w-12" />
                    </div>

                    <div className="space-y-3 p-5 text-left">
                      {/* Üst - Hero stat + 3 yardımcı metrik */}
                      <div className="grid grid-cols-12 gap-3">
                        {/* Big hero stat */}
                        <div className="col-span-12 md:col-span-5 relative overflow-hidden rounded-2xl border border-[#e84978]/30 bg-gradient-to-br from-[#e84978]/15 via-[#9c2752]/8 to-transparent p-5">
                          <div className="text-[10px] uppercase tracking-widest text-zinc-400">Toplam Erişim</div>
                          <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-5xl font-black text-white">1.24</span>
                            <span className="text-2xl font-black text-white">M</span>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-300">▲ %24.5</span>
                            <span className="text-[10px] text-zinc-500">Haziran vs Mayıs</span>
                          </div>
                          <svg viewBox="0 0 200 40" className="mt-3 h-10 w-full" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#e84978" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#e84978" stopOpacity="1" />
                              </linearGradient>
                            </defs>
                            <polyline
                              points="0,30 20,28 40,25 60,22 80,18 100,20 120,15 140,12 160,8 180,5 200,3"
                              fill="none"
                              stroke="url(#heroGrad)"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <polyline
                              points="0,30 20,28 40,25 60,22 80,18 100,20 120,15 140,12 160,8 180,5 200,3 200,40 0,40"
                              fill="rgba(232,73,120,.1)"
                            />
                          </svg>
                        </div>

                        {/* 3 yardımcı metrik */}
                        <div className="col-span-12 md:col-span-7 grid grid-cols-3 gap-3">
                          <div className="rounded-2xl border border-white/8 bg-black/30 p-4">
                            <div className="text-[9px] uppercase tracking-widest text-zinc-500">Etkileşim</div>
                            <div className="mt-1 text-2xl font-black text-white">%4.7</div>
                            <div className="text-[9px] text-emerald-300">▲ %1.2</div>
                            <svg viewBox="0 0 60 20" className="mt-2 h-5 w-full" preserveAspectRatio="none">
                              <polyline points="0,15 10,12 20,14 30,10 40,8 50,5 60,3" fill="none" stroke="#6ee7b7" strokeWidth="1.5" />
                            </svg>
                          </div>
                          <div className="rounded-2xl border border-white/8 bg-black/30 p-4">
                            <div className="text-[9px] uppercase tracking-widest text-zinc-500">Dönüşüm</div>
                            <div className="mt-1 text-2xl font-black text-white">%2.3</div>
                            <div className="text-[9px] text-amber-300">▼ %0.3</div>
                            <svg viewBox="0 0 60 20" className="mt-2 h-5 w-full" preserveAspectRatio="none">
                              <polyline points="0,5 10,7 20,6 30,9 40,11 50,13 60,15" fill="none" stroke="#fcd34d" strokeWidth="1.5" />
                            </svg>
                          </div>
                          <div className="rounded-2xl border border-white/8 bg-black/30 p-4">
                            <div className="text-[9px] uppercase tracking-widest text-zinc-500">ROAS</div>
                            <div className="mt-1 text-2xl font-black text-white">4.8<span className="text-sm text-zinc-500">x</span></div>
                            <div className="text-[9px] text-emerald-300">▲ %18</div>
                            <svg viewBox="0 0 60 20" className="mt-2 h-5 w-full" preserveAspectRatio="none">
                              <polyline points="0,18 10,16 20,14 30,12 40,8 50,5 60,2" fill="none" stroke="#6ee7b7" strokeWidth="1.5" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Orta - Donut + Bar chart */}
                      <div className="grid grid-cols-12 gap-3">
                        {/* Donut chart - Kanal dağılımı */}
                        <div className="col-span-12 md:col-span-5 rounded-2xl border border-white/8 bg-black/30 p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Kanal Dağılımı</span>
                            <span className="font-mono text-[9px] text-zinc-500">Haziran</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <svg viewBox="0 0 42 42" className="h-28 w-28 -rotate-90">
                              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="rgba(255,255,255,.05)" strokeWidth="6" />
                              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#e84978" strokeWidth="6" strokeDasharray="42 58" strokeDashoffset="0" />
                              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#fcd34d" strokeWidth="6" strokeDasharray="24 76" strokeDashoffset="-42" />
                              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#6ee7b7" strokeWidth="6" strokeDasharray="18 82" strokeDashoffset="-66" />
                              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#a78bfa" strokeWidth="6" strokeDasharray="10 90" strokeDashoffset="-84" />
                            </svg>
                            <div className="flex-1 space-y-1.5">
                              {[
                                { c: "bg-[#e84978]", l: "Instagram", v: "42%", n: "518K" },
                                { c: "bg-yellow-300", l: "Meta Ads", v: "24%", n: "296K" },
                                { c: "bg-emerald-300", l: "Google", v: "18%", n: "222K" },
                                { c: "bg-violet-300", l: "TikTok", v: "16%", n: "204K" },
                              ].map((l) => (
                                <div key={l.l} className="flex items-center gap-2 text-[10px]">
                                  <span className={`h-1.5 w-1.5 rounded-full ${l.c}`} />
                                  <span className="flex-1 text-zinc-300">{l.l}</span>
                                  <span className="font-mono text-zinc-500 text-[9px]">{l.n}</span>
                                  <span className="font-mono text-white font-black text-[10px] w-8 text-right">{l.v}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Bar chart - Saatlik dağılım */}
                        <div className="col-span-12 md:col-span-7 rounded-2xl border border-white/8 bg-black/30 p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Saatlik Etkileşim</span>
                            <span className="font-mono text-[9px] text-zinc-500">Bugün</span>
                          </div>
                          <div className="flex h-28 items-end gap-1">
                            {[
                              { h: 15 }, { h: 12 }, { h: 18 }, { h: 25 }, { h: 32 },
                              { h: 45 }, { h: 58 }, { h: 72 }, { h: 85 }, { h: 92 },
                              { h: 78 }, { h: 65 }, { h: 88 }, { h: 95 }, { h: 82 },
                              { h: 68 }, { h: 55 }, { h: 78 }, { h: 92 }, { h: 86 },
                              { h: 64 }, { h: 48 }, { h: 32 }, { h: 22 }, { h: 18 }
                            ].map((bar, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                                <div
                                  className={`w-full rounded-t ${i >= 9 && i <= 18 ? "bg-gradient-to-t from-amber-300 to-amber-200" : "bg-gradient-to-t from-[#e84978]/30 to-[#e84978]"}`}
                                  style={{ height: `${bar.h}%` }}
                                />
                                {i % 4 === 0 && <span className="font-mono text-[7px] text-zinc-600">{i}</span>}
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 flex items-center justify-between font-mono text-[8px] text-zinc-500">
                            <span>00:00</span>
                            <span className="text-amber-300">peak: 12:00-18:00</span>
                            <span>23:00</span>
                          </div>
                        </div>
                      </div>

                      {/* Alt - 4 özet KPI */}
                      <div className="grid grid-cols-2 gap-3 border-t border-white/8 pt-3 md:grid-cols-4">
                        {[
                          { l: "Paylaşım", v: "247", tone: "text-white", bar: 80 },
                          { l: "Beğeni", v: "58.2K", tone: "text-[#ff6e98]", bar: 65 },
                          { l: "Yorum", v: "4.1K", tone: "text-cyan-300", bar: 45 },
                          { l: "Kaydetme", v: "1.8K", tone: "text-amber-300", bar: 30 },
                        ].map((k) => (
                          <div key={k.l}>
                            <div className="text-[8px] uppercase tracking-widest text-zinc-500">{k.l}</div>
                            <div className={`text-base font-black ${k.tone}`}>{k.v}</div>
                            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/5">
                              <div className={`h-full ${k.tone === "text-[#ff6e98]" ? "bg-[#ff6e98]" : k.tone === "text-cyan-300" ? "bg-cyan-300" : k.tone === "text-amber-300" ? "bg-amber-300" : "bg-white/40"}`} style={{ width: `${k.bar}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VARYASYON 3: Takvim Operasyonları */}
              {selectedHeroPanelStyle === 3 && (
                <div className="relative">
                  <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl overflow-hidden shadow-2xl shadow-white/5">
                    <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-red-500/80" />
                        <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                        <span className="h-3 w-3 rounded-full bg-green-500/80" />
                      </div>
                      <div className="rounded-md bg-white/5 px-3 py-1 text-xs text-gray-500">
                        takvim.fogistanbul.com
                      </div>
                      <div className="w-12" />
                    </div>

                    <div className="space-y-3 p-5 text-left">
                      {/* Üst - Ay navigasyonu + istatistik */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button className="rounded-md border border-white/10 p-1.5 text-zinc-500 hover:border-white/30 hover:text-white">‹</button>
                          <div>
                            <div className="text-base font-black text-white">Haziran 2026</div>
                            <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Hafta 26 · 22-28</div>
                          </div>
                          <button className="rounded-md border border-white/10 p-1.5 text-zinc-500 hover:border-white/30 hover:text-white">›</button>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                          {[
                            { c: "bg-yellow-300", l: "Plan" },
                            { c: "bg-[#e84978]", l: "Yayın" },
                            { c: "bg-emerald-300", l: "Onay" },
                            { c: "bg-cyan-300", l: "Çekim" },
                          ].map((t) => (
                            <span key={t.l} className="flex items-center gap-1 font-mono uppercase tracking-widest text-zinc-400">
                              <span className={`h-1.5 w-1.5 rounded-full ${t.c}`} />
                              {t.l}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Orta - Haftalık takvim */}
                      <div>
                        <div className="mb-1 grid grid-cols-7 gap-2">
                          {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((d, i) => (
                            <div key={d} className="text-center">
                              <div className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500">{d}</div>
                              <div className={`text-sm font-black ${i === 2 ? "text-[#e84978]" : "text-white"}`}>{22 + i}</div>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                          {[
                            { items: [
                              { t: "Reel", c: "yellow" },
                              { t: "Post", c: "pink" }
                            ] },
                            { items: [
                              { t: "Story", c: "yellow" }
                            ] },
                            { items: [
                              { t: "Rapor", c: "emerald" },
                              { t: "Görsel", c: "pink" },
                              { t: "Mail", c: "yellow" }
                            ], today: true },
                            { items: [
                              { t: "Banner", c: "pink" }
                            ] },
                            { items: [
                              { t: "Reklam", c: "cyan" },
                              { t: "Yayın", c: "pink" }
                            ] },
                            { items: [
                              { t: "Çekim", c: "cyan" }
                            ] },
                            { items: [] },
                          ].map((cell, idx) => (
                            <div
                              key={idx}
                              className={`min-h-[7rem] rounded-xl border p-2 transition-colors ${
                                cell.today
                                  ? "border-[#e84978]/50 bg-[#e84978]/10 shadow-[0_0_30px_rgba(232,73,120,.2)]"
                                  : "border-white/8 bg-black/20 hover:border-white/20"
                              }`}
                            >
                              <div className="space-y-1">
                                {cell.items.slice(0, 3).map((item, i) => (
                                  <div
                                    key={i}
                                    className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[8px] font-bold ${
                                      item.c === "yellow" ? "bg-yellow-300/15 text-yellow-200" :
                                      item.c === "pink" ? "bg-[#e84978]/15 text-[#ff9db8]" :
                                      item.c === "emerald" ? "bg-emerald-300/15 text-emerald-200" :
                                      "bg-cyan-300/15 text-cyan-200"
                                    }`}
                                  >
                                    <span className={`h-1 w-1 rounded-full ${
                                      item.c === "yellow" ? "bg-yellow-300" :
                                      item.c === "pink" ? "bg-[#e84978]" :
                                      item.c === "emerald" ? "bg-emerald-300" :
                                      "bg-cyan-300"
                                    }`} />
                                    <span className="truncate">{item.t}</span>
                                  </div>
                                ))}
                                {cell.items.length > 3 && (
                                  <div className="text-[7px] font-mono text-zinc-500">+{cell.items.length - 3}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Alt - 4 KPI */}
                      <div className="grid grid-cols-2 gap-3 border-t border-white/8 pt-3 md:grid-cols-4">
                        {[
                          { l: "Bu Hafta", v: "12", tone: "text-white" },
                          { l: "Planlanan", v: "3", tone: "text-yellow-200" },
                          { l: "Yayında", v: "5", tone: "text-[#ff9db8]" },
                          { l: "Çekim", v: "2", tone: "text-cyan-200" },
                        ].map((s) => (
                          <div key={s.l} className="text-center">
                            <div className={`text-2xl font-black ${s.tone}`}>{s.v}</div>
                            <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">{s.l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VARYASYON 4: Müşteri Portföyü */}
              {selectedHeroPanelStyle === 4 && (
                <div className="relative">
                  <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl overflow-hidden shadow-2xl shadow-white/5">
                    <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-red-500/80" />
                        <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                        <span className="h-3 w-3 rounded-full bg-green-500/80" />
                      </div>
                      <div className="rounded-md bg-white/5 px-3 py-1 text-xs text-gray-500">
                        portfoy.fogistanbul.com
                      </div>
                      <div className="w-12" />
                    </div>

                    <div className="space-y-3 p-5 text-left">
                      {/* Üst - Portföy özeti */}
                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-12 md:col-span-5 relative overflow-hidden rounded-2xl border border-[#e84978]/30 bg-gradient-to-br from-[#e84978]/15 to-transparent p-5">
                          <div className="text-[10px] uppercase tracking-widest text-zinc-400">Aktif Markalar</div>
                          <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-5xl font-black text-white">28</span>
                            <span className="text-sm text-emerald-300">+4 bu ay</span>
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-center">
                            <div>
                              <div className="text-base font-black text-white">12</div>
                              <div className="font-mono text-[8px] uppercase text-zinc-500">Kurumsal</div>
                            </div>
                            <div>
                              <div className="text-base font-black text-white">9</div>
                              <div className="font-mono text-[8px] uppercase text-zinc-500">E-ticaret</div>
                            </div>
                            <div>
                              <div className="text-base font-black text-white">7</div>
                              <div className="font-mono text-[8px] uppercase text-zinc-500">Startup</div>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-12 md:col-span-7 grid grid-cols-3 gap-3">
                          {[
                            { l: "Aylık Ciro", v: "₺248K", tone: "from-emerald-300/15 border-emerald-300/20" },
                            { l: "Memnuniyet", v: "%94", tone: "from-amber-300/15 border-amber-300/20" },
                            { l: "Yenileme", v: "%78", tone: "from-cyan-300/15 border-cyan-300/20" },
                          ].map((m) => (
                            <div key={m.l} className={`rounded-2xl border bg-gradient-to-br to-transparent p-4 ${m.tone}`}>
                              <div className="text-[9px] uppercase tracking-widest text-zinc-500">{m.l}</div>
                              <div className="mt-1 text-xl font-black text-white">{m.v}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Orta - Marka kartları grid */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white">Marka Portföyü</span>
                          <span className="font-mono text-[9px] text-zinc-500">28 marka · 5 yıldız sıralı</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                          {[
                            { name: "X Kozmetik", sector: "Kozmetik", tone: "from-pink-400 to-rose-500", projects: 12, revenue: "₺42K", star: 5, status: "Aktif" },
                            { name: "Y Mobilya", sector: "Mobilya", tone: "from-amber-400 to-orange-500", projects: 8, revenue: "₺38K", star: 5, status: "Aktif" },
                            { name: "Z Tekstil", sector: "Tekstil", tone: "from-emerald-400 to-teal-500", projects: 6, revenue: "₺28K", star: 4, status: "Aktif" },
                            { name: "Q Lojistik", sector: "Lojistik", tone: "from-cyan-400 to-blue-500", projects: 4, revenue: "₺22K", star: 4, status: "Aktif" },
                          ].map((brand) => (
                            <div key={brand.name} className="group rounded-xl border border-white/8 bg-black/30 p-3 transition-all hover:border-[#e84978]/30 hover:bg-black/40">
                              <div className="flex items-center gap-2">
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-black text-white ${brand.tone}`}>
                                  {brand.name.charAt(0)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-[11px] font-bold text-white">{brand.name}</div>
                                  <div className="text-[9px] text-zinc-500">{brand.sector}</div>
                                </div>
                                <span className="rounded-full bg-emerald-300/15 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest text-emerald-300">{brand.status}</span>
                              </div>
                              <div className="mt-2.5 flex items-center justify-between">
                                <div>
                                  <div className="text-[8px] uppercase tracking-widest text-zinc-500">Proje</div>
                                  <div className="text-sm font-black text-white">{brand.projects}</div>
                                </div>
                                <div>
                                  <div className="text-[8px] uppercase tracking-widest text-zinc-500">Aylık</div>
                                  <div className="text-sm font-black text-emerald-300">{brand.revenue}</div>
                                </div>
                                <div className="flex">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <svg key={i} viewBox="0 0 16 16" className={`h-2.5 w-2.5 ${i < brand.star ? "text-amber-300" : "text-zinc-700"}`} fill="currentColor">
                                      <path d="M8 1 L10 6 L15 6 L11 9 L13 14 L8 11 L3 14 L5 9 L1 6 L6 6 Z" />
                                    </svg>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Alt - Alt marka + detay */}
                      <div className="grid grid-cols-12 gap-3 border-t border-white/8 pt-3">
                        <div className="col-span-12 md:col-span-7 rounded-xl border border-white/8 bg-black/30 p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Büyüme Trendi</span>
                            <span className="font-mono text-[9px] text-zinc-500">son 6 ay</span>
                          </div>
                          <svg viewBox="0 0 200 40" className="h-12 w-full" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="growth" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            <polyline
                              points="0,30 30,28 60,25 90,22 120,18 150,12 180,8 200,4"
                              fill="none"
                              stroke="#6ee7b7"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <polyline
                              points="0,30 30,28 60,25 90,22 120,18 150,12 180,8 200,4 200,40 0,40"
                              fill="url(#growth)"
                            />
                          </svg>
                        </div>
                        <div className="col-span-12 md:col-span-5 rounded-xl border border-white/8 bg-black/30 p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Sektör Dağılımı</span>
                          </div>
                          <div className="space-y-1.5">
                            {[
                              { c: "bg-pink-300", l: "Kozmetik", v: "%21", n: 6 },
                              { c: "bg-amber-300", l: "Mobilya", v: "%18", n: 5 },
                              { c: "bg-emerald-300", l: "Tekstil", v: "%14", n: 4 },
                              { c: "bg-cyan-300", l: "Diğer", v: "%47", n: 13 },
                            ].map((s) => (
                              <div key={s.l} className="flex items-center gap-2">
                                <span className={`h-1.5 w-1.5 rounded-full ${s.c}`} />
                                <span className="flex-1 text-[10px] text-zinc-300">{s.l}</span>
                                <span className="font-mono text-[9px] text-zinc-500">{s.n} marka</span>
                                <span className="font-mono text-[10px] font-black text-white w-9 text-right">{s.v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-white/5 to-white/0 rounded-3xl blur-2xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ABOUT & ORBIT VISUALIZATION SECTION */}
      <section id="hakkimizda" className="relative z-10 py-24 md:py-32 border-t border-white/[0.04] bg-[#0A0A0C]/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          
          {/* About Us Design Variation Switcher */}
          <div className="flex flex-col items-center gap-3 mb-16">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest font-mono">Hakkımızda Tasarım Felsefesi:</span>
            <div className="flex flex-wrap justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 p-1.5 max-w-4xl">
              {[
                { n: 1, label: "1. Cosmic Orbit" },
                { n: 2, label: "2. Cinema Timeline" },
                { n: 3, label: "3. Neo-Brutalist Poster" },
                { n: 4, label: "4. Blueprint Map" },
                { n: 5, label: "5. Swiss Editorial" },
                { n: 6, label: "6. Editorial Layers" },
                { n: 7, label: "7. Portal Stage" }
              ].map((s) => (
                <button
                  key={s.n}
                  type="button"
                  onClick={() => setSelectedAboutStyle(s.n)}
                  className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold tracking-wide transition-all duration-300 ${
                    selectedAboutStyle === s.n
                      ? 'bg-[#e84978] text-white shadow-md shadow-pink-500/25 scale-105'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* VARYASYON 1: Cosmic Orbit (Modern Classic) */}
          {selectedAboutStyle === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center text-left">
              <div className="lg:col-span-6 space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-[#e84978] text-[11px] font-semibold uppercase tracking-wider">
                  Hakkımızda
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  Biz Sadece Bir Ajans Değiliz,<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-amber-600">Biz Bir Değişim Hareketiyiz.</span>
                </h2>
                <p className="text-zinc-400 text-[15px] leading-relaxed">
                  Dijital dünyada sınırları aşmak için gerçek verilerle çalışır, şeffaf süreçler kurgularız. Bizimle çalışırken e-posta trafiğinde kaybolmaz, sürecin her anında nerede olduğumuzu anlık olarak bilirsiniz.
                </p>
                <p className="text-zinc-400 text-[15px] leading-relaxed">
                  Müşteri portalımız üzerinden görevlerinizin güncel durumunu izleyebilir, hazırlanan içeriklere tek tıkla onay verebilir ve tüm reklam harcamalarınızın getirisini şeffafça görebilirsiniz.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('iletisim');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-[13px] font-semibold transition-all duration-300 hover:translate-x-1"
                >
                  <span>Detaylı Keşfet</span>
                  <ArrowUpRight className="w-4 h-4 text-[#e84978]" />
                </button>
              </div>

              <div className="lg:col-span-6 flex items-center justify-center py-8">
                <div className="relative w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] flex items-center justify-center">
                  <div className="absolute w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] md:w-[360px] md:h-[360px] rounded-full border border-white/[0.03] animate-[spin_50s_linear_infinite]" />
                  <div className="absolute w-[170px] h-[170px] sm:w-[200px] sm:h-[200px] md:w-[260px] md:h-[260px] rounded-full border border-white/[0.04]" />
                  <div className="absolute w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[160px] md:h-[160px] rounded-full border border-white/[0.06]" />
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-pink-600/90 to-amber-600/90 flex items-center justify-center shadow-[0_0_50px_rgba(232,73,120,0.3)] z-20">
                    <span className="text-md sm:text-lg md:text-xl font-bold tracking-[0.2em] text-white drop-shadow-md">FOG</span>
                    <div className="absolute inset-2 rounded-full border border-white/20 animate-ping opacity-30" />
                  </div>
                  <div className="absolute w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] md:w-[360px] md:h-[360px] animate-[spin_30s_linear_infinite] z-10">
                    {[
                      { icon: BarChart3, angle: 0 },
                      { icon: Instagram, angle: 60 },
                      { icon: Globe, angle: 120 },
                      { icon: Megaphone, angle: 180 },
                      { icon: Calendar, angle: 240 },
                      { icon: MessageSquare, angle: 300 }
                    ].map((item, index) => {
                      const Icon = item.icon;
                      const rad = (item.angle * Math.PI) / 180;
                      return (
                        <div 
                          key={index}
                          className="absolute w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 -ml-4 -mt-4 sm:-ml-5 sm:-mt-5 md:-ml-6 md:-mt-6 rounded-full bg-[#121216] border border-white/[0.08] hover:border-[#e84978] flex items-center justify-center transition-all duration-300 shadow-xl group cursor-pointer"
                          style={{
                            left: `calc(50% + ${Math.cos(rad) * 50}%)`,
                            top: `calc(50% + ${Math.sin(rad) * 50}%)`
                          }}
                        >
                          <div className="animate-[spin_30s_linear_infinite] [animation-direction:reverse] text-zinc-400 group-hover:text-[#e84978] transition-colors duration-300">
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VARYASYON 2: Akışkan Zaman Çizelgesi (Liquid Flow Timeline) */}
          {selectedAboutStyle === 2 && (
            <div className="mx-auto max-w-6xl text-left">
              <div className="relative overflow-hidden border border-white/10 bg-gradient-to-br from-[#08080c] via-[#0a0a12] to-[#08080a] p-6 md:p-12">
                {/* Arka plan parıltı */}
                <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[120%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(232,73,120,.18),transparent_60%)]" />
                <div className="pointer-events-none absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-amber-300/8 blur-[120px]" />
                <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_center,#fff_1px,transparent_1px)] [background-size:24px_24px]" />

                <div className="relative grid gap-10 lg:grid-cols-[0.38fr_0.62fr]">
                  <div className="flex flex-col justify-center">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.36em] text-[#e84978]">
                      Liquid timeline / 04 stages
                    </span>
                    <h2 className="mt-6 text-4xl font-black leading-[0.92] tracking-tight text-white md:text-6xl">
                      Brief'ten rapora
                      <br />
                      <span className="bg-gradient-to-r from-[#ff6e98] via-amber-200 to-white bg-clip-text text-transparent">
                        akan tek süreç.
                      </span>
                    </h2>
                    <p className="mt-6 max-w-md text-sm leading-7 text-zinc-400">
                      FOG İstanbul iş akışını bir nehir gibi görünür kılar. Her damla, ajansınızın ürettiği işin bir anını temsil eder; siz de müşteri olarak o nehrin kıyısında, hangi aşamada olduğunuzu canlı izlersiniz.
                    </p>
                    <div className="mt-8 flex items-center gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">Akış</span>
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <motion.span
                            key={i}
                            className="h-1.5 w-8 rounded-full bg-white/15"
                            animate={{ backgroundColor: ['rgba(255,255,255,0.15)', 'rgba(232,73,120,1)', 'rgba(255,255,255,0.15)'] }}
                            transition={{ duration: 2, delay: i * 0.25, repeat: Infinity }}
                          />
                        ))}
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">Devam Ediyor</span>
                    </div>
                  </div>

                  <div className="relative">
                    {/* Dalga SVG'si */}
                    <div className="relative h-44 md:h-56">
                      <svg viewBox="0 0 600 200" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="flowGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#e84978" stopOpacity="0.1" />
                            <stop offset="35%" stopColor="#e84978" stopOpacity="1" />
                            <stop offset="65%" stopColor="#fcd34d" stopOpacity="1" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
                          </linearGradient>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>

                        {/* Arka dalga */}
                        <motion.path
                          d="M 0 100 Q 75 60 150 100 T 300 100 T 450 100 T 600 100"
                          fill="none"
                          stroke="rgba(232,73,120,0.18)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          animate={{ d: [
                            "M 0 100 Q 75 60 150 100 T 300 100 T 450 100 T 600 100",
                            "M 0 100 Q 75 140 150 100 T 300 100 T 450 100 T 600 100",
                            "M 0 100 Q 75 60 150 100 T 300 100 T 450 100 T 600 100"
                          ] }}
                          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        />

                        {/* Ana akış çizgisi */}
                        <motion.path
                          d="M 0 100 Q 75 60 150 100 T 300 100 T 450 100 T 600 100"
                          fill="none"
                          stroke="url(#flowGrad)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          filter="url(#glow)"
                          strokeDasharray="600"
                          initial={{ strokeDashoffset: 600 }}
                          animate={{ strokeDashoffset: 0 }}
                          transition={{ duration: 2.5, ease: "easeOut" }}
                        />

                        {/* Aktif parçacık */}
                        <motion.circle
                          r="6"
                          fill="#fff"
                          filter="url(#glow)"
                          initial={{ offsetDistance: "0%" }}
                          animate={{ offsetDistance: "100%" }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          style={{ offsetPath: "path('M 0 100 Q 75 60 150 100 T 300 100 T 450 100 T 600 100')" }}
                        />
                      </svg>

                      {/* 4 düğüm noktası */}
                      {[
                        { left: "8%", label: "01" },
                        { left: "36%", label: "02" },
                        { left: "64%", label: "03" },
                        { left: "92%", label: "04" }
                      ].map((node, idx) => (
                        <div
                          key={idx}
                          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                          style={{ left: node.left }}
                        >
                          <div className="relative">
                            <span className="absolute inset-0 -m-2 rounded-full bg-[#e84978]/30 blur-md animate-pulse" />
                            <span className="absolute inset-0 -m-1 rounded-full border border-[#e84978]/60 animate-ping" />
                            <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-[#e84978] text-[9px] font-black text-white shadow-[0_0_20px_rgba(232,73,120,.6)]">
                              {node.label}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 4 Adım Kartı */}
                    <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
                      {[
                        { num: "01", title: "Brief", desc: "Hedef ve kapsam netleşir.", tone: "from-[#e84978]/20 to-transparent" },
                        { num: "02", title: "Üretim", desc: "Tasarım ve içerik işler.", tone: "from-[#e84978]/15 to-amber-300/10" },
                        { num: "03", title: "Onay", desc: "Kararlar portalda toplanır.", tone: "from-amber-300/15 to-amber-300/0" },
                        { num: "04", title: "Rapor", desc: "Sonuçlar okunur, rota çıkar.", tone: "from-white/10 to-transparent" }
                      ].map((step, idx) => {
                        const isActive = aboutTimelineStep === idx;
                        return (
                          <button
                            key={step.num}
                            type="button"
                            onClick={() => setAboutTimelineStep(idx)}
                            className={`group relative overflow-hidden border bg-gradient-to-b p-4 text-left backdrop-blur transition-all duration-500 ${
                              isActive
                                ? "border-[#e84978] from-white/[0.05] to-white/[0.01] shadow-[0_0_30px_rgba(232,73,120,.18)]"
                                : "border-white/8 from-white/[0.03] to-white/[0.005] hover:border-[#e84978]/40"
                            }`}
                          >
                            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${step.tone} ${isActive ? "opacity-100" : "opacity-60"}`} />
                            <div className="relative">
                              <span className="font-mono text-[9px] font-black text-[#e84978]">{step.num}</span>
                              <h4 className={`mt-3 text-sm font-black transition-colors ${isActive ? "text-white" : "text-zinc-200"}`}>{step.title}</h4>
                              <p className="mt-2 text-[10px] leading-4 text-zinc-500">{step.desc}</p>
                            </div>
                            <span
                              className={`absolute bottom-2 right-2 h-1.5 w-1.5 rounded-full bg-[#e84978] transition-all ${
                                isActive ? "opacity-100 shadow-[0_0_10px_rgba(232,73,120,1)]" : "opacity-0 group-hover:opacity-100"
                              }`}
                            />
                            {isActive && (
                              <span className="absolute -top-px left-2 right-2 h-px bg-gradient-to-r from-transparent via-[#e84978] to-transparent" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VARYASYON 3: Neo-Brutalist Poster (Bold Typography & Raw Grid) */}
          {selectedAboutStyle === 3 && (
            <div className="border-4 border-black bg-[#FFDE4D] p-8 md:p-12 text-left text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 space-y-6">
                  <span className="font-mono text-xs font-black uppercase tracking-widest border-2 border-black px-3 py-1 bg-white inline-block">
                    Hakkımızda // Felsefemiz
                  </span>
                  <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                    ŞEFFAFLIK BİR SEÇENEK DEĞİL, ZORUNLULUKTUR.
                  </h2>
                  <p className="font-bold text-sm md:text-base leading-relaxed text-black/80 font-sans">
                    Ajans-müşteri ilişkilerini baştan yazıyoruz. Rapor beklemek, işlerin durumunu sormak için zaman harcamayın. FOG Müşteri Portalı ile ajansınızın mutfağını canlı izleyin. Her şey gözünüzün önünde.
                  </p>
                </div>
                
                <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                  {[
                    ["35+", "Dijital Uzman"],
                    ["%100", "Şeffaf Süreç"],
                    ["7/24", "Canlı Takip"],
                    ["Sıfır", "Mail Kaosu"]
                  ].map(([val, label]) => (
                    <div key={label} className="p-4 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
                      <span className="block text-3xl font-black">{val}</span>
                      <span className="block text-[10px] font-bold uppercase tracking-wider mt-1 text-zinc-700">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VARYASYON 4: İzometrik Operasyon Lab */}
          {selectedAboutStyle === 4 && (
            <div className="mx-auto max-w-6xl text-left">
              <div className="relative overflow-hidden border border-white/10 bg-[#07070b] p-6 md:p-10">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(232,73,120,.10),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(102,68,255,.08),transparent_45%)]" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e84978]/40 to-transparent" />

                <div className="relative mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.36em] text-[#e84978]">
                      Isometric lab / 6 platforms
                    </span>
                    <h2 className="mt-4 text-3xl font-black leading-[0.95] tracking-tight text-white md:text-5xl">
                      Ajanstan müşteriye,
                      <br />
                      <span className="text-zinc-500">3D bir operasyon sahası.</span>
                    </h2>
                  </div>
                  <p className="max-w-sm text-xs leading-6 text-zinc-500">
                    Strateji, üretim, onay ve raporlama FOG portalında ayrı katmanlar değil; izometrik bir çalışma alanında yan yana duran platformlardır. Her biri kendi metrikleriyle canlıdır.
                  </p>
                </div>

                {/* İzometrik Sahne */}
                <div className="relative" style={{ perspective: "1800px" }}>
                  <div
                    className="relative mx-auto h-[520px] w-full max-w-4xl"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: "rotateX(58deg) rotateZ(-42deg)",
                    }}
                  >
                    {/* Zemin ızgarası */}
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{
                        backgroundImage: "linear-gradient(rgba(232,73,120,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(232,73,120,.25) 1px, transparent 1px)",
                        backgroundSize: "60px 60px",
                        transform: "translateZ(-80px)",
                      }}
                    />
                    <div
                      className="absolute inset-0 opacity-60"
                      style={{
                        backgroundImage: "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                        transform: "translateZ(-80px)",
                      }}
                    />

                    {/* SVG bağlantı çizgileri */}
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 520" preserveAspectRatio="none" style={{ transform: "translateZ(0px)" }}>
                      <defs>
                        <linearGradient id="linkGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#e84978" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="#fcd34d" stopOpacity="0.6" />
                        </linearGradient>
                      </defs>
                      <path d="M 180 140 L 380 200 L 580 160 L 720 280" stroke="url(#linkGrad)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
                      <path d="M 180 140 L 80 320 L 280 380 L 480 350" stroke="rgba(232,73,120,0.4)" strokeWidth="1" strokeDasharray="3 5" fill="none" />
                      <circle r="3" fill="#e84978">
                        <animateMotion dur="6s" repeatCount="indefinite" path="M 180 140 L 380 200 L 580 160 L 720 280" />
                      </circle>
                    </svg>

                    {/* Platform 1: Strateji */}
                    <div
                      className="absolute left-[8%] top-[18%] w-44"
                      style={{ transform: "translateZ(20px)" }}
                    >
                      <div className="border border-[#e84978]/40 bg-gradient-to-br from-[#1a0c14] to-[#0a0a0e] p-4 shadow-[0_0_30px_rgba(232,73,120,.25)]">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] font-black text-[#e84978]">P-01</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                        </div>
                        <h4 className="mt-3 text-sm font-black text-white">Strateji</h4>
                        <div className="mt-3 space-y-1.5">
                          <div className="h-1.5 w-full rounded-full bg-white/10" />
                          <div className="h-1.5 w-3/4 rounded-full bg-white/8" />
                          <div className="h-1.5 w-1/2 rounded-full bg-[#e84978]/70" />
                        </div>
                        <div className="mt-3 flex items-center justify-between text-[9px] font-mono text-zinc-500">
                          <span>HEDEF</span>
                          <span className="text-emerald-300">+24%</span>
                        </div>
                      </div>
                    </div>

                    {/* Platform 2: İçerik */}
                    <div
                      className="absolute left-[40%] top-[28%] w-44"
                      style={{ transform: "translateZ(60px)" }}
                    >
                      <div className="border border-white/15 bg-gradient-to-br from-[#13131a] to-[#0a0a0e] p-4 shadow-[0_0_30px_rgba(255,255,255,.05)]">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] font-black text-amber-300">P-02</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-300 animate-pulse" />
                        </div>
                        <h4 className="mt-3 text-sm font-black text-white">İçerik</h4>
                        <div className="mt-3 grid grid-cols-3 gap-1">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <span
                              key={i}
                              className={`h-6 rounded-sm ${i % 3 === 0 ? 'bg-[#e84978]/50' : 'bg-white/8'}`}
                            />
                          ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between text-[9px] font-mono text-zinc-500">
                          <span>12 HAZIR</span>
                          <span className="text-amber-300">3 REVİZYON</span>
                        </div>
                      </div>
                    </div>

                    {/* Platform 3: Reklam */}
                    <div
                      className="absolute left-[70%] top-[22%] w-44"
                      style={{ transform: "translateZ(40px)" }}
                    >
                      <div className="border border-white/15 bg-gradient-to-br from-[#13131a] to-[#0a0a0e] p-4 shadow-[0_0_30px_rgba(255,255,255,.05)]">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] font-black text-amber-300">P-03</span>
                          <span className="font-mono text-[9px] text-emerald-300">ROAS</span>
                        </div>
                        <h4 className="mt-3 text-2xl font-black text-white">4.8x</h4>
                        <div className="mt-3 flex h-10 items-end gap-1">
                          {[30, 50, 40, 70, 55, 85, 70, 95].map((h, i) => (
                            <span
                              key={i}
                              className="flex-1 rounded-t bg-gradient-to-t from-[#e84978]/40 to-amber-200"
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                        <div className="mt-2 text-[9px] font-mono text-zinc-500">SON 7 GÜN</div>
                      </div>
                    </div>

                    {/* Platform 4: Onay */}
                    <div
                      className="absolute left-[4%] top-[60%] w-44"
                      style={{ transform: "translateZ(0px)" }}
                    >
                      <div className="border border-white/15 bg-gradient-to-br from-[#13131a] to-[#0a0a0e] p-4 shadow-[0_0_30px_rgba(255,255,255,.05)]">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] font-black text-amber-300">P-04</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-[#e84978] animate-pulse" />
                        </div>
                        <h4 className="mt-3 text-sm font-black text-white">Onay Kuyruğu</h4>
                        <div className="mt-3 space-y-1.5">
                          {["Logo", "Story", "Rapor"].map((t) => (
                            <div key={t} className="flex items-center justify-between rounded-sm bg-black/30 px-2 py-1 text-[9px]">
                              <span className="text-zinc-300">{t}</span>
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Platform 5: Ekip */}
                    <div
                      className="absolute left-[32%] top-[68%] w-44"
                      style={{ transform: "translateZ(45px)" }}
                    >
                      <div className="border border-white/15 bg-gradient-to-br from-[#13131a] to-[#0a0a0e] p-4 shadow-[0_0_30px_rgba(255,255,255,.05)]">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] font-black text-amber-300">P-05</span>
                          <span className="font-mono text-[9px] text-zinc-500">7</span>
                        </div>
                        <h4 className="mt-3 text-sm font-black text-white">Ekip Aktif</h4>
                        <div className="mt-3 flex -space-x-2">
                          {["F", "A", "M", "S", "+3"].map((n) => (
                            <span
                              key={n}
                              className="flex h-7 w-7 items-center justify-center rounded-full border border-[#0a0a0e] bg-gradient-to-br from-[#e84978] to-[#9c2752] text-[9px] font-black text-white"
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                        <div className="mt-3 text-[9px] font-mono text-zinc-500">5 AKTİF / 2 OFFLINE</div>
                      </div>
                    </div>

                    {/* Platform 6: Rapor */}
                    <div
                      className="absolute left-[60%] top-[62%] w-44"
                      style={{ transform: "translateZ(15px)" }}
                    >
                      <div className="border border-emerald-300/30 bg-gradient-to-br from-[#0a1612] to-[#0a0a0e] p-4 shadow-[0_0_30px_rgba(110,231,183,.15)]">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] font-black text-emerald-300">P-06</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                        </div>
                        <h4 className="mt-3 text-sm font-black text-white">Rapor</h4>
                        <div className="mt-3 space-y-1.5">
                          <div className="flex items-center justify-between text-[9px]">
                            <span className="text-zinc-400">Erişim</span>
                            <span className="text-emerald-300">+38%</span>
                          </div>
                          <div className="h-px bg-white/10" />
                          <div className="flex items-center justify-between text-[9px]">
                            <span className="text-zinc-400">Maliyet</span>
                            <span className="text-emerald-300">-12%</span>
                          </div>
                          <div className="h-px bg-white/10" />
                          <div className="flex items-center justify-between text-[9px]">
                            <span className="text-zinc-400">Ciro</span>
                            <span className="text-amber-300">+4.2x</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Yüzen parçacıklar */}
                    <span className="absolute right-10 top-10 h-1.5 w-1.5 rounded-full bg-[#e84978] shadow-[0_0_20px_rgba(232,73,120,.8)]" style={{ transform: "translateZ(100px)" }} />
                    <span className="absolute left-1/2 top-1/3 h-1 w-1 rounded-full bg-amber-200 shadow-[0_0_15px_rgba(252,211,77,.8)]" style={{ transform: "translateZ(120px)" }} />
                    <span className="absolute right-1/3 bottom-1/4 h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_15px_rgba(110,231,183,.8)]" style={{ transform: "translateZ(80px)" }} />
                  </div>
                </div>

                {/* Alt kontrol barı */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                  <div className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#e84978] animate-pulse" />
                    <span>FOG ops / canlı senkron</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>6 platforms</span>
                    <span className="text-zinc-700">·</span>
                    <span>1 merkez</span>
                    <span className="text-zinc-700">·</span>
                    <span className="text-[#e84978]">izometrik derinlik: 60</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VARYASYON 5: Swiss Editorial (Minimalist Magazine Style) */}
          {selectedAboutStyle === 5 && (
            <div className="border-t border-white text-left divide-y divide-white/10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-12">
                <div className="lg:col-span-5">
                  <span className="font-mono text-xs text-zinc-500 block">/ VİZYON /</span>
                  <h3 className="text-3xl font-light tracking-tight text-white mt-4 uppercase">
                    Biz Sadece İş Üretmiyoruz,<br/>
                    Süreci Yönetiyoruz.
                  </h3>
                </div>
                <div className="lg:col-span-7">
                  <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
                    Geleneksel ajansların kapalı kutu süreçlerinden bıktıysanız doğru yerdesiniz. FOG İstanbul, tüm operasyonel adımlarını müşterilerine tamamen açan ilk ajanstır. Hangi reklam kampanyasının ne kadar getiri (ROI) sağladığını, sosyal medya grafiklerinizin hangi onay aşamasında olduğunu 7/24 canlı portalımızdan izleyebilirsiniz.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
                {[
                  ["01. VERİ ODAKLI", "Her kararımızı ve bütçe planlamamızı gerçek kullanıcı verilerine ve A/B test analizlerine dayandırırız."],
                  ["02. %100 ŞEFFAFLIK", "Müşteri portalımız aracılığıyla ajansımızın çalışma mutfağını ve harcamaları canlı izletiriz."],
                  ["03. ÇEVİK YÖNETİM", " WhatsApp karmaşasını bitiren anlık portal içi mesajlaşma ve hızlı onay süreçleri uygularız."]
                ].map(([title, desc]) => (
                  <div key={title} className="space-y-4">
                    <h4 className="text-sm font-bold text-white tracking-tight">{title}</h4>
                    <p className="text-zinc-400 text-xs leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VARYASYON 6: Müze Galerisi Sergi (Gallery Walk) */}
          {selectedAboutStyle === 6 && (
            <div className="mx-auto max-w-6xl text-left">
              <div className="relative overflow-hidden border border-white/10 bg-[#0c0a08] p-6 md:p-12">
                {/* Duvar dokusu */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, rgba(255,255,255,.08) 0px, rgba(255,255,255,.08) 1px, transparent 1px, transparent 80px), repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0px, rgba(255,255,255,.05) 1px, transparent 1px, transparent 120px)",
                  }}
                />
                {/* Genel tavan spotu */}
                <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[90%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(255,225,180,.10),transparent_60%)]" />

                <div className="relative mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.36em] text-[#e84978]">
                      Gallery walk / Sergi
                    </span>
                    <h2 className="mt-4 text-3xl font-black leading-[0.95] tracking-tight text-white md:text-5xl">
                      Dört eser, tek hikâye:
                      <br />
                      <span className="italic text-zinc-500">şeffaf ajans felsefesi.</span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-[0.28em] text-zinc-500">
                    <span>Salon 03</span>
                    <span className="text-zinc-700">/</span>
                    <span className="text-[#e84978]">FOG Galeri</span>
                    <span className="text-zinc-700">/</span>
                    <span>2026</span>
                  </div>
                </div>

                {/* Sergi alanı */}
                <div className="relative">
                  {/* Tavan rayı */}
                  <div className="absolute -top-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <div className="absolute -top-1 left-0 right-0 flex justify-between">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/30"
                        style={{ marginLeft: i === 0 ? "12%" : 0, marginRight: i === 3 ? "12%" : 0 }}
                      />
                    ))}
                  </div>

                  {/* 4 Çerçeve */}
                  <div className="relative grid grid-cols-2 gap-4 pt-6 md:grid-cols-4 md:gap-6">
                    {[
                      {
                        no: "I",
                        title: "Plan",
                        sub: "Strateji panosu",
                        body: "Hangi işin neden yapıldığı, hangi sırayla ilerlediği baştan netleşir.",
                        tone: "from-[#1a0a14] to-[#0a0a0e]",
                        accent: "#e84978",
                        size: "tall"
                      },
                      {
                        no: "II",
                        title: "Üretim",
                        sub: "Mutfak canlı",
                        body: "Tasarım, içerik ve reklam işleri aynı anda, durumu ile izlenir.",
                        tone: "from-[#0a0a18] to-[#0a0a0e]",
                        accent: "#8b5cf6",
                        size: "wide"
                      },
                      {
                        no: "III",
                        title: "Onay",
                        sub: "Karar mercii",
                        body: "Revizyonlar, onaylar ve açıklamalar tek bir kuyrukta toplanır.",
                        tone: "from-[#18120a] to-[#0a0a0e]",
                        accent: "#fcd34d",
                        size: "regular"
                      },
                      {
                        no: "IV",
                        title: "Rapor",
                        sub: "Sonuç vitrini",
                        body: "Erişim, ROAS ve dönüşüm metrikleri galeri gibi sergilenir.",
                        tone: "from-[#0a1812] to-[#0a0a0e]",
                        accent: "#6ee7b7",
                        size: "tall"
                      }
                    ].map((art, idx) => (
                      <div key={art.no} className="group relative">
                        {/* Tavan spotu */}
                        <div
                          className="pointer-events-none absolute -top-10 left-1/2 h-32 w-32 -translate-x-1/2 bg-[radial-gradient(circle,rgba(255,225,180,.10),transparent_70%)]"
                          style={{ opacity: 0.6 - idx * 0.08 }}
                        />
                        {/* Çerçeve */}
                        <div
                          className={`relative overflow-hidden border-2 border-white/12 bg-gradient-to-br ${art.tone} p-4 shadow-[0_18px_40px_rgba(0,0,0,.5)] transition-all duration-500 group-hover:-translate-y-2 group-hover:border-white/30`}
                        >
                          {/* Çerçeve içi beyaz kenar */}
                          <div className="relative border border-white/8 bg-black/30 p-4">
                            {/* Müze etiketi */}
                            <div className="absolute -top-3 left-3 flex items-center gap-2 bg-[#0a0a0e] px-2 py-1">
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: art.accent }}
                              />
                              <span className="font-mono text-[9px] font-black tracking-widest text-white">
                                ESER {art.no}
                              </span>
                            </div>

                            <div className="space-y-3 pt-1">
                              <span
                                className="font-mono text-[9px] font-bold uppercase tracking-[0.3em]"
                                style={{ color: art.accent }}
                              >
                                {art.sub}
                              </span>
                              <h3 className="text-2xl font-black italic text-white md:text-3xl">{art.title}</h3>
                              <div className="h-px w-12 bg-white/15" />
                              <p className="text-[10px] leading-5 text-zinc-400">{art.body}</p>

                              {/* Minik görsel eleman */}
                              <div className="mt-3 flex items-center gap-2">
                                {idx === 0 && (
                                  <div className="flex h-10 w-full items-end gap-1">
                                    {[40, 70, 55, 85, 60].map((h, i) => (
                                      <span
                                        key={i}
                                        className="flex-1 rounded-sm"
                                        style={{
                                          height: `${h}%`,
                                          background: `linear-gradient(to top, ${art.accent}55, ${art.accent}11)`,
                                        }}
                                      />
                                    ))}
                                  </div>
                                )}
                                {idx === 1 && (
                                  <div className="grid h-10 w-full grid-cols-4 gap-1">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                      <span
                                        key={i}
                                        className="rounded-sm"
                                        style={{
                                          background: i % 3 === 0 ? `${art.accent}55` : "rgba(255,255,255,.05)",
                                          height: i % 2 === 0 ? "60%" : "100%",
                                        }}
                                      />
                                    ))}
                                  </div>
                                )}
                                {idx === 2 && (
                                  <div className="flex w-full flex-col gap-1.5">
                                    {["Logo rev.", "Story", "Rapor"].map((t) => (
                                      <div
                                        key={t}
                                        className="flex items-center justify-between rounded-sm bg-white/5 px-2 py-1 text-[8px] text-zinc-300"
                                      >
                                        <span>{t}</span>
                                        <span className="h-1 w-1 rounded-full" style={{ backgroundColor: art.accent }} />
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {idx === 3 && (
                                  <div className="grid w-full grid-cols-3 gap-2">
                                    {[
                                      ["ROAS", "4.2x"],
                                      ["Erişim", "+38%"],
                                      ["Onay", "12"]
                                    ].map(([l, v]) => (
                                      <div key={l} className="text-center">
                                        <span className="block text-sm font-black text-white">{v}</span>
                                        <span className="text-[8px] uppercase tracking-widest text-zinc-500">{l}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Çerçeve alt etiketi */}
                          <div className="mt-3 flex items-center justify-between text-[8px] font-mono uppercase tracking-[0.28em] text-zinc-600">
                            <span>FOG · {String(idx + 1).padStart(2, "0")}/04</span>
                            <span>2026</span>
                          </div>
                        </div>

                        {/* Çerçeve gölgesi (zeminde) */}
                        <div className="mx-auto mt-3 h-1.5 w-3/4 rounded-full bg-black/60 blur-md" />
                      </div>
                    ))}
                  </div>

                  {/* Zemin çizgisi */}
                  <div className="mt-10 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                  <div className="mt-1 flex justify-between text-[8px] font-mono uppercase tracking-[0.32em] text-zinc-700">
                    <span>← giriş</span>
                    <span>çıkış →</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VARYASYON 7: Holografik Komuta Merkezi */}
          {selectedAboutStyle === 7 && (
            <div className="mx-auto max-w-6xl text-left">
              <div className="relative overflow-hidden border border-[#e84978]/20 bg-gradient-to-b from-[#08080c] via-[#0a0a14] to-[#08080a] p-6 md:p-10">
                {/* İnce ızgara arka plan */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(232,73,120,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(232,73,120,.4) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                    maskImage: "radial-gradient(ellipse_at_center, black 30%, transparent 75%)",
                    WebkitMaskImage: "radial-gradient(ellipse_at_center, black 30%, transparent 75%)",
                  }}
                />

                {/* Tarama çizgisi */}
                <motion.div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e84978] to-transparent"
                  initial={{ y: 0, opacity: 0.6 }}
                  animate={{ y: 700, opacity: [0, 0.8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                />

                <div className="relative mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#e84978] shadow-[0_0_12px_rgba(232,73,120,1)] animate-pulse" />
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.36em] text-[#e84978]">
                        Holographic command / live
                      </span>
                    </div>
                    <h2 className="mt-4 text-3xl font-black leading-[0.95] tracking-tight text-white md:text-5xl">
                      Müşteri ekranında
                      <br />
                      <span className="bg-gradient-to-r from-[#ff6e98] via-amber-200 to-white bg-clip-text text-transparent">
                        ajansın hologramı.
                      </span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-500">
                    <span>scan: aktif</span>
                    <span className="text-zinc-700">/</span>
                    <span className="text-[#e84978]">lat 12ms</span>
                    <span className="text-zinc-700">/</span>
                    <span>usr 1</span>
                  </div>
                </div>

                {/* Hologram Sahnesi */}
                <div className="relative" style={{ perspective: "1400px" }}>
                  <div
                    className="relative h-[480px] w-full overflow-hidden border border-[#e84978]/15 bg-black/30"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Zemin ızgarası perspektifli */}
                    <div
                      className="absolute inset-x-0 bottom-0 h-3/4"
                      style={{
                        transform: "rotateX(70deg) translateY(40%)",
                        transformOrigin: "center bottom",
                        backgroundImage:
                          "linear-gradient(rgba(232,73,120,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(232,73,120,.5) 1px, transparent 1px)",
                        backgroundSize: "50px 50px",
                        maskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 80%)",
                        WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 80%)",
                      }}
                    />
                    {/* Zemin parlaması */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[radial-gradient(ellipse_at_50%_100%,rgba(232,73,120,.4),transparent_60%)]" />

                    {/* Merkez Hologram */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      {/* Dış halka */}
                      <motion.div
                        className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#e84978]/40"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        style={{ borderTopColor: "rgba(232,73,120,0.9)", borderRightColor: "transparent", borderBottomColor: "rgba(232,73,120,0.3)", borderLeftColor: "transparent" }}
                      >
                        <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#e84978] shadow-[0_0_15px_rgba(232,73,120,1)]" />
                        <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,1)]" />
                      </motion.div>

                      {/* Orta halka */}
                      <motion.div
                        className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-300/30"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        style={{ borderLeftColor: "rgba(252,211,77,0.9)", borderTopColor: "transparent", borderRightColor: "transparent", borderBottomColor: "rgba(252,211,77,0.3)" }}
                      >
                        <span className="absolute top-1/2 -right-1 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,1)]" />
                      </motion.div>

                      {/* İç çekirdek */}
                      <div className="relative h-24 w-24">
                        <div className="absolute inset-0 rounded-full bg-[#e84978]/20 blur-xl" />
                        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#e84978] via-amber-300 to-white opacity-90 shadow-[0_0_40px_rgba(232,73,120,.7)]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-mono text-[10px] font-black tracking-[0.3em] text-[#08080a]">FOG</span>
                        </div>
                      </div>

                      {/* Çekirdek halka pulse */}
                      <span className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border border-[#e84978]/40" />
                    </div>

                    {/* Yüzen veri paneli - Sol üst */}
                    <div
                      className="absolute left-[6%] top-[10%] w-44 border border-[#e84978]/30 bg-black/55 p-3 backdrop-blur-md"
                      style={{ boxShadow: "0 0 30px rgba(232,73,120,.18), inset 0 0 20px rgba(232,73,120,.05)" }}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-mono text-[8px] font-black tracking-widest text-[#e84978]">MODÜL 01</span>
                        <span className="h-1 w-1 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,1)]" />
                      </div>
                      <div className="font-mono text-[8px] uppercase tracking-widest text-zinc-500">Aktif İş</div>
                      <div className="mt-1 text-3xl font-black text-white">18</div>
                      <div className="mt-2 h-1 w-full overflow-hidden bg-white/10">
                        <motion.div
                          className="h-full bg-gradient-to-r from-[#e84978] to-amber-300"
                          initial={{ width: 0 }}
                          animate={{ width: "75%" }}
                          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                        />
                      </div>
                    </div>

                    {/* Yüzen veri paneli - Sağ üst */}
                    <div
                      className="absolute right-[6%] top-[10%] w-44 border border-amber-300/30 bg-black/55 p-3 backdrop-blur-md"
                      style={{ boxShadow: "0 0 30px rgba(252,211,77,.15), inset 0 0 20px rgba(252,211,77,.05)" }}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-mono text-[8px] font-black tracking-widest text-amber-300">MODÜL 02</span>
                        <span className="h-1 w-1 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,1)]" />
                      </div>
                      <div className="font-mono text-[8px] uppercase tracking-widest text-zinc-500">Bu ay ROAS</div>
                      <div className="mt-1 text-3xl font-black text-white">4.2<span className="text-base text-zinc-500">x</span></div>
                      <div className="mt-2 flex h-6 items-end gap-0.5">
                        {[35, 55, 40, 75, 60, 90, 70].map((h, i) => (
                          <motion.span
                            key={i}
                            className="flex-1 rounded-sm bg-gradient-to-t from-amber-300/30 to-amber-300"
                            initial={{ height: `${h * 0.3}%` }}
                            animate={{ height: `${h}%` }}
                            transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity, repeatType: "reverse" }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Yüzen veri paneli - Sol alt */}
                    <div
                      className="absolute bottom-[12%] left-[6%] w-44 border border-emerald-300/30 bg-black/55 p-3 backdrop-blur-md"
                      style={{ boxShadow: "0 0 30px rgba(110,231,183,.15), inset 0 0 20px rgba(110,231,183,.05)" }}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-mono text-[8px] font-black tracking-widest text-emerald-300">MODÜL 03</span>
                        <span className="h-1 w-1 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,1)]" />
                      </div>
                      <div className="font-mono text-[8px] uppercase tracking-widest text-zinc-500">Onay Bekleyen</div>
                      <div className="mt-1 text-3xl font-black text-white">5</div>
                      <div className="mt-2 space-y-1">
                        {["Logo", "Story", "Rapor", "Mail", "Banner"].map((t, i) => (
                          <div key={i} className="flex items-center gap-2 text-[8px] text-zinc-400">
                            <span className="h-1 w-1 rounded-full bg-emerald-300" />
                            <span className="flex-1">{t}</span>
                            <span className="font-mono text-zinc-600">0{i + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Yüzen veri paneli - Sağ alt */}
                    <div
                      className="absolute bottom-[12%] right-[6%] w-44 border border-white/15 bg-black/55 p-3 backdrop-blur-md"
                      style={{ boxShadow: "0 0 30px rgba(255,255,255,.08), inset 0 0 20px rgba(255,255,255,.03)" }}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-mono text-[8px] font-black tracking-widest text-white">MODÜL 04</span>
                        <span className="h-1 w-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,1)]" />
                      </div>
                      <div className="font-mono text-[8px] uppercase tracking-widest text-zinc-500">Ekip Sinyal</div>
                      <div className="mt-2 grid grid-cols-5 gap-1">
                        {Array.from({ length: 25 }).map((_, i) => {
                          const intensity = ((i * 37) % 80) / 100 + 0.2;
                          return (
                            <span
                              key={i}
                              className="h-3 w-full"
                              style={{
                                background: `rgba(232, 73, 120, ${intensity})`,
                                boxShadow: intensity > 0.7 ? "0 0 6px rgba(232,73,120,.5)" : "none",
                              }}
                            />
                          );
                        })}
                      </div>
                      <div className="mt-2 text-[8px] font-mono text-zinc-500">7 AKTİF · 2 OFF</div>
                    </div>

                    {/* HUD köşe işaretleri */}
                    <span className="absolute left-3 top-3 h-4 w-4 border-l border-t border-[#e84978]/60" />
                    <span className="absolute right-3 top-3 h-4 w-4 border-r border-t border-[#e84978]/60" />
                    <span className="absolute left-3 bottom-3 h-4 w-4 border-l border-b border-[#e84978]/60" />
                    <span className="absolute right-3 bottom-3 h-4 w-4 border-r border-b border-[#e84978]/60" />

                    {/* Köşe koordinatları */}
                    <span className="absolute left-3 top-3 mt-5 font-mono text-[8px] tracking-widest text-[#e84978]/70">X 41.0082°</span>
                    <span className="absolute right-3 top-3 mt-5 font-mono text-[8px] tracking-widest text-[#e84978]/70">Y 28.9784°</span>
                    <span className="absolute bottom-3 left-3 mb-5 font-mono text-[8px] tracking-widest text-[#e84978]/70">FREQ 24.7Hz</span>
                    <span className="absolute bottom-3 right-3 mb-5 font-mono text-[8px] tracking-widest text-[#e84978]/70">PWR 98%</span>
                  </div>
                </div>

                {/* Alt durum çubuğu */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e84978]/15 pt-4 font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-500">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e84978] opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#e84978]" />
                    </span>
                    <span>Hologram senkron aktif</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>4 modül</span>
                    <span className="text-zinc-700">·</span>
                    <span>1 çekirdek</span>
                    <span className="text-zinc-700">·</span>
                    <span className="text-[#e84978]">projeksiyon derinliği: 70</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* NASIL ÇALIŞIR? (HOW IT WORKS) */}
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

      {/* SERVICES SECTION */}
      <section id="ozellikler" className="relative z-10 py-24 bg-[#0A0A0C]/50 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-[#e84978] text-[11px] font-semibold uppercase tracking-wider">
              Çözümler
            </div>
            
            {/* Design Philosophy Switcher */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Tasarım Felsefesi Seçin:</span>
              <div className="flex flex-wrap justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 p-1.5 max-w-2xl">
                {[
                  { n: 1, label: "Liquid Aurora (Floating Canvas)" },
                  { n: 2, label: "Vertical Split Accordion" },
                  { n: 3, label: "Neo-Brutalism / Figma" },
                  { n: 4, label: "Circular Showcase (Modern Radial)" },
                  { n: 5, label: "Swiss Minimalist Editorial" }
                ].map((s) => (
                  <button
                    key={s.n}
                    type="button"
                    onClick={() => setSelectedServiceStyle(s.n)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 ${
                      selectedServiceStyle === s.n
                        ? 'bg-[#e84978] text-white shadow-lg shadow-pink-500/30 scale-105'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight pt-6">Dijital İhtiyaçlarınız İçin 360° Çözümler</h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-[14px]">
              Tüm dijital süreçlerinizi bir araya toplayan FOG Müşteri Portalı modülleri ile ajans iş birliklerinizi üst seviyeye taşıyın.
            </p>
          </div>

          {/* TASARIM 1: Liquid Aurora Canvas (Fluid Mesh & Equal Height Cards) */}
          {selectedServiceStyle === 1 && (
            <div className="relative min-h-[500px] flex flex-col justify-center">
              {/* Mesh blur background lights */}
              <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-pink-500/10 blur-[120px] pointer-events-none animate-pulse" />
              <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-purple-600/10 blur-[140px] pointer-events-none animate-pulse" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10 text-left">
                {services.map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <div
                      key={index}
                      className="p-6 rounded-[2.5rem] bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.08] hover:border-[#e84978]/40 hover:from-[#e84978]/10 hover:to-[#e84978]/0 transition-all duration-500 ease-out hover:scale-[1.03] group flex flex-col justify-between min-h-[250px] shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
                    >
                      <div className="space-y-6">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 text-white group-hover:scale-110 group-hover:from-[#e84978] group-hover:to-[#e84978] transition-all duration-300">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold tracking-tight text-white group-hover:text-[#e84978] transition-colors">{service.title}</h3>
                          <p className="text-zinc-400 text-xs leading-relaxed">{service.description}</p>
                        </div>
                      </div>
                      
                      <div className="pt-4 flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-[#e84978] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span>Sistem Aktif</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e84978] animate-ping" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TASARIM 2: Minimalist Spotlight Split Display (Cinematic Split Screen) */}
          {selectedServiceStyle === 2 && (
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
          )}

          {/* TASARIM 3: Neo-Brutalism / Figma Stili (Bold & High-Contrast) */}
          {selectedServiceStyle === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left text-black">
              {services.map((service, index) => {
                const Icon = service.icon;
                // Figma brutalist alternating flat bright backgrounds
                const bgColors = ['bg-[#FFDE4D]', 'bg-[#FF6B6B]', 'bg-[#4D96FF]', 'bg-[#6BCB77]', 'bg-[#F07A24]', 'bg-[#A084CA]', 'bg-[#9ADCFF]', 'bg-[#B4FF9F]'];
                const cardBg = bgColors[index % bgColors.length];
                return (
                  <div
                    key={index}
                    className={`p-6 border-4 border-black rounded-none transition-all duration-200 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1.5 hover:translate-y-1.5 hover:shadow-none flex flex-col justify-between min-h-[260px] ${cardBg}`}
                  >
                    <div className="space-y-6">
                      <div className="w-12 h-12 border-4 border-black rounded-none bg-white flex items-center justify-center text-black">
                        <Icon className="w-6 h-6 stroke-[3]" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-black uppercase tracking-tight leading-tight">{service.title}</h3>
                        <p className="text-black text-xs font-semibold leading-relaxed font-sans">{service.description}</p>
                      </div>
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-wider pt-3 border-t-2 border-black/20 flex justify-between">
                      <span>FOG BRUTALIST</span>
                      <span>*0{index + 1}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TASARIM 4: Circular Showcase (Modern Radial Display) */}
          {selectedServiceStyle === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
              {/* Dial Wheel Controller */}
              <div className="lg:col-span-5 flex items-center justify-center py-6">
                <div className="relative w-[320px] h-[320px] rounded-full border border-white/10 bg-white/[0.01] backdrop-blur flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.3)]">
                  {/* Rotating orbital rings */}
                  <div className="absolute inset-4 rounded-full border border-white/5 animate-[spin_20s_linear_infinite]" />
                  <div className="absolute inset-10 rounded-full border border-dashed border-white/10" />

                  {/* Core display sphere */}
                  <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#e84978] to-purple-600 flex flex-col items-center justify-center z-10 shadow-[0_0_40px_rgba(232,73,120,0.3)] animate-pulse">
                    {(() => {
                      const Icon = services[radarActiveIndex].icon;
                      return <Icon className="w-8 h-8 text-white" />;
                    })()}
                  </div>

                  {/* 8 Satellite dial buttons */}
                  {services.map((service, index) => {
                    const Icon = service.icon;
                    const angle = (index * (360 / services.length) * Math.PI) / 180;
                    const radius = 110; // px radius for placement
                    const isActive = radarActiveIndex === index;
                    
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setRadarActiveIndex(index)}
                        style={{
                          transform: `translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px)`,
                        }}
                        className={`absolute w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-20 border ${
                          isActive
                            ? 'bg-[#e84978] border-none text-white scale-110 shadow-[0_0_15px_rgba(232,73,120,0.4)]'
                            : 'bg-[#121217] border-white/10 text-zinc-400 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Display Monitor Dashboard */}
              <div className="lg:col-span-7">
                <div className="rounded-[2.5rem] border border-white/[0.08] bg-[#121217]/50 backdrop-blur-xl p-8 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#e84978]/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="space-y-6 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-[#e84978] text-[10px] font-bold uppercase tracking-wider">
                      Premium Modül {radarActiveIndex + 1} / {services.length}
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                        {services[radarActiveIndex].title}
                      </h3>
                      <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">
                        {services[radarActiveIndex].description}
                      </p>
                    </div>

                    {/* Features list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-6 border-t border-white/5 text-xs text-zinc-300 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e84978]" />
                        <span>Kullanıcı Dostu Arayüz</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e84978]" />
                        <span>7/24 Gerçek Zamanlı Takip</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e84978]" />
                        <span>Gelişmiş API Entegrasyonları</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e84978]" />
                        <span>Özel Ajans Desteği</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TASARIM 5: Swiss Editorial / Minimalist Dergi Stili (Typography Driven) */}
          {selectedServiceStyle === 5 && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-12 gap-y-12 text-left">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div
                    key={index}
                    className="py-8 border-b border-white/10 flex flex-col justify-between min-h-[220px] transition-all duration-300 group hover:border-white"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-4">
                        <span className="font-mono text-xs text-zinc-500 block">0{index + 1}</span>
                        <h3 className="text-xl font-light tracking-tight text-white transition-colors group-hover:text-zinc-300">{service.title}</h3>
                        <p className="text-zinc-400 text-[11px] leading-relaxed max-w-md">{service.description}</p>
                      </div>

                      {/* Display large icon on hover */}
                      <div className="w-12 h-12 flex items-center justify-center text-zinc-800 opacity-25 group-hover:opacity-100 group-hover:text-white transition-all duration-500 scale-90 group-hover:scale-105 shrink-0">
                        <Icon className="w-8 h-8 stroke-[1]" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ONE-CLICK APPROVAL SECTION */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-8 border-t border-white/[0.04]">
        {/* Tasarım Felsefesi Switcher */}
        <div className="flex flex-col items-center gap-3 mb-14">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest font-mono">Onay Tasarım Felsefesi:</span>
          <div className="flex flex-wrap justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 p-1.5 max-w-3xl">
            {[
              { n: 1, label: "1. Klasik" },
              { n: 2, label: "2. Mail Inbox" },
              { n: 3, label: "3. Onay Tablosu" },
              { n: 4, label: "4. Yorum Dizisi" },
              { n: 5, label: "5. Takvim" },
              { n: 6, label: "6. Isı Haritası" }
            ].map((s) => (
              <button
                key={s.n}
                type="button"
                onClick={() => setSelectedApprovalStyle(s.n)}
                className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold tracking-wide transition-all duration-300 ${
                  selectedApprovalStyle === s.n
                    ? 'bg-[#e84978] text-white shadow-md shadow-pink-500/25 scale-105'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* VARYASYON 1: Klasik (Orijinal) */}
        {selectedApprovalStyle === 1 && (
          <div className="grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
            <div className="text-left">
              <p className="text-sm font-bold uppercase tracking-[0.36em] text-[#e84978]">Tek Tıkla Onay</p>
              <h2 className="mt-5 text-balance text-4xl font-bold tracking-[-0.04em] sm:text-6xl">Onay beklemek yok, süreç tek aksiyonda ilerler.</h2>
              <p className="mt-7 text-lg leading-8 text-white/62">
                İçerik planı panelinize düştüğünde anında bildirim alırsınız. Onaylayın, revizyon isteyin veya açıklamanızı ekleyin; talep doğrudan ilgili ajans çalışanına gider.
              </p>
            </div>
            <div className="relative min-h-[28rem] overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.02))] p-8 shadow-[0_0_80px_rgba(232,73,120,.12)] text-left">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(232,73,120,.28),transparent_48%)]" />
              <div className="relative space-y-5">
                {[
                  ["Instagram Reels", "Revizyon bekliyor", "border-yellow-300/35 text-yellow-100"],
                  ["Ürün lansman postu", "Onaya hazır", "border-[#e84978]/50 text-[#ff9db8]"],
                  ["Haftalık reklam raporu", "Tamamlandı", "border-emerald-300/35 text-emerald-100"],
                ].map(([name, status, tone]) => (
                  <div key={name} className="rounded-3xl border border-white/10 bg-black/28 p-5 backdrop-blur">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-semibold text-white">{name}</span>
                      <span className={`rounded-full border px-3 py-1 text-xs ${tone}`}>{status}</span>
                    </div>
                    <div className="mt-5 flex gap-3">
                      <button className="rounded-2xl bg-[#e84978] px-4 py-3 text-sm font-bold text-white cursor-pointer">Onayla</button>
                      <button className="rounded-2xl border border-white/12 px-4 py-3 text-sm font-bold text-white/75 cursor-pointer">Revizyon İste</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VARYASYON 2: Mail Inbox */}
        {selectedApprovalStyle === 2 && (
          <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="text-left">
              <p className="text-sm font-bold uppercase tracking-[0.36em] text-[#e84978]">Tek Tıkla Onay</p>
              <h2 className="mt-5 text-balance text-4xl font-bold tracking-[-0.04em] sm:text-5xl">Onay kutusu gibi: gelen, açılan, karara bağlanan.</h2>
              <p className="mt-6 text-base leading-8 text-white/62">
                Ajans gönderileri e-posta kutusuna düşer. Sol kategoriden seçim yaparsınız, ortada bekleyen postaları görür, sağda hızlıca okur ve tek tıkla onay veya revizyona karar verirsiniz.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0a0a14] to-[#08080a]">
              <div className="grid min-h-[28rem] grid-cols-[10rem_1fr]">
                <aside className="border-r border-white/8 bg-black/30 p-4">
                  <div className="mb-5 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#e84978] to-amber-300 text-xs font-black text-white">F</div>
                    <span className="text-sm font-black text-white">FOG Inbox</span>
                  </div>
                  <button className="mb-4 w-full rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#08080a]">
                    + Yeni taslak
                  </button>
                  <nav className="space-y-1">
                    {[
                      { label: "Gelen Kutusu", count: 5, active: true, icon: "📥" },
                      { label: "Yıldızlı", count: 2, icon: "⭐" },
                      { label: "Bekleyen", count: 3, icon: "🕒" },
                      { label: "Arşiv", count: 24, icon: "📦" },
                      { label: "Etiketler", count: null, icon: "🏷️" }
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
                          item.active ? "bg-[#e84978]/15 text-white" : "text-zinc-500 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-xs">{item.icon}</span>
                          <span>{item.label}</span>
                        </span>
                        {item.count !== null && (
                          <span className={`font-mono text-[9px] ${item.active ? "text-[#ff9db8]" : "text-zinc-600"}`}>
                            {item.count}
                          </span>
                        )}
                      </div>
                    ))}
                  </nav>
                </aside>
                <div className="border-r border-white/8">
                  <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                    <span className="text-xs font-black uppercase tracking-widest text-white">Gelen Kutusu</span>
                    <div className="flex items-center gap-1">
                      <button className="rounded p-1.5 text-zinc-500 hover:bg-white/5 hover:text-white">↻</button>
                      <button className="rounded p-1.5 text-zinc-500 hover:bg-white/5 hover:text-white">🗑</button>
                    </div>
                  </div>
                  {[
                    {
                      from: "FOG İstanbul",
                      avatar: "F",
                      avatarBg: "bg-gradient-to-br from-[#e84978] to-amber-300",
                      subject: "Revizyon hazır: Instagram Reels — Yaz Koleksiyonu",
                      preview: "Logo pozisyonunu güncelledik, 3 saniye önce...",
                      time: "2 dk",
                      unread: true,
                      active: true,
                      statusColor: "bg-yellow-300"
                    },
                    {
                      from: "Tasarım Ekibi",
                      avatar: "T",
                      avatarBg: "bg-gradient-to-br from-amber-300 to-white",
                      subject: "Yeni görseller: Ürün lansman postu",
                      preview: "5 varyasyon eklendi, onayınızı bekliyor...",
                      time: "8 dk",
                      unread: true,
                      statusColor: "bg-[#e84978]"
                    },
                    {
                      from: "Rapor Bot",
                      avatar: "R",
                      avatarBg: "bg-gradient-to-br from-emerald-300 to-cyan-300",
                      subject: "Haftalık rapor · Haziran 24",
                      preview: "Otomatik oluşturuldu, ER %38 artış...",
                      time: "32 dk",
                      unread: false,
                      statusColor: "bg-emerald-300"
                    }
                  ].map((mail) => (
                    <div
                      key={mail.subject}
                      className={`group relative flex cursor-pointer items-start gap-3 border-b border-white/5 px-4 py-3 transition-colors ${
                        mail.active ? "bg-[#e84978]/8" : "hover:bg-white/[0.025]"
                      }`}
                    >
                      <span className="mt-2 flex h-2 w-2 shrink-0">
                        {mail.unread && <span className="h-2 w-2 rounded-full bg-[#e84978]" />}
                      </span>
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${mail.avatarBg} text-xs font-black text-white`}>
                        {mail.avatar}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className={`text-xs ${mail.unread ? "font-black text-white" : "font-bold text-zinc-400"}`}>
                            {mail.from}
                          </span>
                          <span className="font-mono text-[9px] text-zinc-600">{mail.time}</span>
                        </div>
                        <p className={`mt-0.5 truncate text-[11px] ${mail.unread ? "font-bold text-white" : "text-zinc-400"}`}>
                          {mail.subject}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] text-zinc-500">{mail.preview}</p>
                        <div className="mt-2 flex translate-y-1 items-center gap-1.5 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                          <button className="rounded-md bg-emerald-300/15 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-300 hover:bg-emerald-300/25">✓</button>
                          <button className="rounded-md bg-yellow-300/15 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-yellow-300 hover:bg-yellow-300/25">↻</button>
                          <button className="rounded-md bg-white/5 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:bg-white/10 hover:text-white">⭐</button>
                          <button className="rounded-md bg-white/5 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:bg-white/10 hover:text-white">💬</button>
                        </div>
                      </div>
                      {mail.active && <span className={`absolute right-0 top-3 h-8 w-1 rounded-l-full ${mail.statusColor}`} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VARYASYON 3: Onay Tablosu (Simple CRM List) */}
        {selectedApprovalStyle === 3 && (
          <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="text-left">
              <p className="text-sm font-bold uppercase tracking-[0.36em] text-[#e84978]">Tek Tıkla Onay</p>
              <h2 className="mt-5 text-balance text-4xl font-bold tracking-[-0.04em] sm:text-5xl">Sadece liste: gönderen, içerik, karar.</h2>
              <p className="mt-6 text-base leading-8 text-white/62">
                Ajans panelindeki onay kuyruğu. Her satırda ne gönderildiği, kimden geldiği ve sizin kararınız net. Filtreleyin, sıralayın, tek tıkla onay veya revize verin.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d12] p-4 shadow-[0_30px_80px_rgba(0,0,0,.5)]">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/8 pb-3">
                <div className="flex items-center gap-1.5">
                  {[
                    { label: "Tümü", count: 5, active: true },
                    { label: "Bekleyen", count: 3 },
                    { label: "Onaylanan", count: 1 },
                    { label: "Revize", count: 1 }
                  ].map((f) => (
                    <button
                      key={f.label}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition ${
                        f.active
                          ? "bg-[#e84978] text-white"
                          : "text-zinc-500 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {f.label} <span className="ml-1 opacity-70">{f.count}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  <span>sırala:</span>
                  <button className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-zinc-300 hover:border-white/30">yeni ↓</button>
                </div>
              </div>
              <div className="grid grid-cols-[1fr_5rem_5rem_7rem] gap-3 border-b border-white/8 px-2 py-2 text-[10px] font-mono font-black uppercase tracking-widest text-zinc-500">
                <div>İçerik</div>
                <div>Tür</div>
                <div>Durum</div>
                <div className="text-right">Aksiyon</div>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { name: "Instagram Reels", type: "Video", sub: "Yaz koleksiyonu · 15 sn", who: "Rüya K.", tone: "pink", status: "Revize", statusTone: "bg-[#e84978]/15 text-[#ff9db8]" },
                  { name: "Ürün Lansman", type: "Görsel", sub: "5 varyasyon", who: "Tasarım", tone: "emerald", status: "Bekliyor", statusTone: "bg-yellow-300/15 text-yellow-200" },
                  { name: "Haftalık Rapor", type: "Rapor", sub: "Haziran 24", who: "Rapor Bot", tone: "cyan", status: "Onaylandı", statusTone: "bg-emerald-300/15 text-emerald-200" },
                  { name: "Story Seti", type: "Görsel", sub: "5 adet", who: "Tasarım", tone: "amber", status: "Bekliyor", statusTone: "bg-yellow-300/15 text-yellow-200" },
                  { name: "Banner Reklam", type: "Reklam", sub: "Meta Ads · 3 boyut", who: "Reklam", tone: "rose", status: "Bekliyor", statusTone: "bg-yellow-300/15 text-yellow-200" }
                ].map((row) => (
                  <div
                    key={row.name}
                    className="group grid grid-cols-[1fr_5rem_5rem_7rem] items-center gap-3 px-2 py-2.5 transition-colors hover:bg-white/[0.025]"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br text-[10px] font-black text-white ${
                        row.tone === "pink" ? "from-[#ff6e98] to-[#9c2752]" :
                        row.tone === "emerald" ? "from-emerald-300 to-cyan-300" :
                        row.tone === "cyan" ? "from-cyan-300 to-blue-300" :
                        row.tone === "amber" ? "from-amber-300 to-yellow-300" :
                        "from-rose-300 to-rose-500"
                      }`}>
                        {row.who.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-white">{row.name}</div>
                        <div className="truncate text-[10px] text-zinc-500">{row.sub} · {row.who}</div>
                      </div>
                    </div>
                    <div className="text-[10px] text-zinc-400">{row.type}</div>
                    <div>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${row.statusTone}`}>
                        {row.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-1.5">
                      {row.status === "Onaylandı" ? (
                        <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-300">✓</span>
                      ) : (
                        <>
                          <button className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-zinc-400 transition hover:border-white/30 hover:text-white">
                            Detay
                          </button>
                          <button className="rounded-md bg-[#e84978] px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white transition hover:bg-[#ff5b8a]">
                            ✓
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/8 pt-2.5 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                <span>5 satır · 3 bekleyen</span>
                <span>sayfa 1/1</span>
              </div>
            </div>
          </div>
        )}

        {/* VARYASYON 4: Sesli Yorum Dizisi (Chat Thread) */}
        {selectedApprovalStyle === 4 && (
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
        )}

        {/* VARYASYON 5: Takvim Görünümü (Haftalık Ajanda) */}
        {selectedApprovalStyle === 5 && (
          <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="text-left">
              <p className="text-sm font-bold uppercase tracking-[0.36em] text-[#e84978]">Tek Tıkla Onay</p>
              <h2 className="mt-5 text-balance text-4xl font-bold tracking-[-0.04em] sm:text-5xl">Onaylar takvime dağılır, hangi gün yoğun görünür.</h2>
              <p className="mt-6 text-base leading-8 text-white/62">
                Ajans içerikleri haftanın günlerine yayılır. Hangi gün kaç onay beklediğini sıcaklık haritası gibi görür, o güne tıklayıp detaya inersiniz. Süreç planlı, gözünüz önünde ilerler.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0a0a14] to-[#08080a] p-5">
              <div className="mb-4 flex items-center justify-between border-b border-white/8 pb-3">
                <div className="flex items-center gap-3">
                  <button className="rounded-md border border-white/10 p-1.5 text-zinc-500 transition hover:border-white/30 hover:text-white">‹</button>
                  <div>
                    <div className="text-sm font-black text-white">Haziran 2026</div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Hafta 26 · 22-28</div>
                  </div>
                  <button className="rounded-md border border-white/10 p-1.5 text-zinc-500 transition hover:border-white/30 hover:text-white">›</button>
                </div>
                <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-yellow-300" />Bekliyor</span>
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#e84978]" />İnceleme</span>
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />Onay</span>
                </div>
              </div>
              <div className="mb-2 grid grid-cols-7 gap-2">
                {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((d) => (
                  <div key={d} className="text-center font-mono text-[10px] font-black uppercase tracking-widest text-zinc-500">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {[
                  { day: 22, items: [{ tone: "yellow", label: "Reels" }, { tone: "pink", label: "Post" }] },
                  { day: 23, items: [{ tone: "yellow", label: "Story" }] },
                  { day: 24, items: [{ tone: "emerald", label: "Rapor" }, { tone: "pink", label: "Görsel" }, { tone: "yellow", label: "Mail" }], today: true },
                  { day: 25, items: [{ tone: "pink", label: "Banner" }] },
                  { day: 26, items: [] },
                  { day: 27, items: [{ tone: "yellow", label: "Video" }, { tone: "pink", label: "Carousel" }] },
                  { day: 28, items: [{ tone: "emerald", label: "Aylık" }] }
                ].map((cell) => (
                  <div
                    key={cell.day}
                    className={`relative min-h-[7.5rem] rounded-xl border p-2 transition-all ${
                      cell.today
                        ? "border-[#e84978]/50 bg-[#e84978]/10 shadow-[0_0_30px_rgba(232,73,120,.2)]"
                        : "border-white/8 bg-black/30 hover:border-white/20"
                    }`}
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className={`font-mono text-[10px] font-black ${cell.today ? "text-[#ff9db8]" : "text-zinc-500"}`}>
                        {String(cell.day).padStart(2, "0")}
                      </span>
                      {cell.today && <span className="h-1.5 w-1.5 rounded-full bg-[#e84978] animate-pulse" />}
                    </div>
                    <div className="space-y-1">
                      {cell.items.slice(0, 3).map((item, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[8px] font-bold ${
                            item.tone === "yellow" ? "bg-yellow-300/15 text-yellow-200" :
                            item.tone === "pink" ? "bg-[#e84978]/15 text-[#ff9db8]" :
                            "bg-emerald-300/15 text-emerald-200"
                          }`}
                        >
                          <span className={`h-1 w-1 rounded-full ${
                            item.tone === "yellow" ? "bg-yellow-300" :
                            item.tone === "pink" ? "bg-[#e84978]" : "bg-emerald-300"
                          }`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                      ))}
                      {cell.items.length > 3 && (
                        <div className="text-[8px] font-mono text-zinc-500">+{cell.items.length - 3}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 border-t border-white/8 pt-3">
                {[
                  { label: "Bu hafta", value: "12", tone: "text-white" },
                  { label: "Bekliyor", value: "3", tone: "text-yellow-200" },
                  { label: "İncelemede", value: "5", tone: "text-[#ff9db8]" },
                  { label: "Onaylandı", value: "4", tone: "text-emerald-200" }
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className={`text-2xl font-black ${stat.tone}`}>{stat.value}</div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VARYASYON 6: Sıcaklık Haritası (Heatmap) */}
        {selectedApprovalStyle === 6 && (
          <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="text-left">
              <p className="text-sm font-bold uppercase tracking-[0.36em] text-[#e84978]">Tek Tıkla Onay</p>
              <h2 className="mt-5 text-balance text-4xl font-bold tracking-[-0.04em] sm:text-5xl">Bir yılın onay haritası, gözünüzün önünde.</h2>
              <p className="mt-6 text-base leading-8 text-white/62">
                365 günlük onay yoğunluğu tek bakışta. Koyu hücreler yoğun günleri, açık hücreler sakin günleri gösterir. Hangi güne tıklarsanız o günün detayı açılır.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-[#e84978]/20 bg-gradient-to-br from-[#0a0a14] via-[#08080c] to-[#0a0a14] p-5 shadow-[0_30px_80px_rgba(0,0,0,.5)]">
              <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(232,73,120,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(232,73,120,.3) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(232,73,120,.10),transparent_50%)]" />
              <div className="relative">
                <div className="mb-4 flex items-center justify-between border-b border-white/8 pb-3">
                  <div>
                    <div className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-500">YILLIK ISI HARİTASI</div>
                    <div className="mt-0.5 text-2xl font-black text-white">2026</div>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                    <span>toplam <span className="font-black text-white">247</span> onay</span>
                    <span className="text-zinc-700">·</span>
                    <span>günlük ort <span className="font-black text-white">0.7</span></span>
                  </div>
                </div>
                <div className="ml-8 mb-1 grid grid-cols-12 gap-0 text-[8px] font-mono uppercase tracking-widest text-zinc-500">
                  {["Ock", "Şbt", "Mrt", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"].map((m) => (
                    <div key={m} className="text-left">{m}</div>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <div className="flex flex-col justify-between pt-0 text-[7px] font-mono uppercase tracking-widest text-zinc-500">
                    <span>Pzt</span>
                    <span>Çar</span>
                    <span>Cum</span>
                    <span>Paz</span>
                  </div>
                  <div className="grid grid-cols-[repeat(52,1fr)] gap-[2px] flex-1">
                    {Array.from({ length: 52 * 7 }).map((_, i) => {
                      const week = Math.floor(i / 7)
                      const day = i % 7
                      const seed = (week * 31 + day * 7) % 100
                      let level = 0
                      if (week < 8) level = seed < 30 ? 0 : seed < 60 ? 1 : seed < 85 ? 2 : 3
                      else if (week < 18) level = seed < 20 ? 1 : seed < 50 ? 2 : seed < 75 ? 3 : 4
                      else if (week < 24) level = seed < 25 ? 2 : seed < 55 ? 3 : seed < 80 ? 4 : 4
                      else if (week < 35) level = seed < 30 ? 1 : seed < 60 ? 2 : seed < 85 ? 3 : 4
                      else if (week < 44) level = seed < 20 ? 1 : seed < 45 ? 2 : seed < 70 ? 3 : 4
                      else level = seed < 30 ? 0 : seed < 55 ? 1 : seed < 80 ? 2 : 3
                      const isToday = week === 24 && day === 3
                      const isWeekend = day === 5 || day === 6
                      return (
                        <div
                          key={i}
                          className={`aspect-square rounded-[2px] transition-all hover:scale-150 hover:z-10 hover:ring-1 hover:ring-white/50 ${
                            isToday ? "ring-1 ring-[#e84978] shadow-[0_0_8px_rgba(232,73,120,.8)]" : ""
                          } ${
                            level === 0 ? (isWeekend ? "bg-white/3" : "bg-white/5")
                            : level === 1 ? "bg-[#e84978]/20"
                            : level === 2 ? "bg-[#e84978]/40"
                            : level === 3 ? "bg-[#e84978]/70"
                            : "bg-[#e84978] shadow-[0_0_4px_rgba(232,73,120,.6)]"
                          }`}
                        />
                      )
                    })}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3">
                  <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                    <span>az</span>
                    <div className="flex gap-0.5">
                      <div className="h-3 w-3 rounded-sm bg-white/5" />
                      <div className="h-3 w-3 rounded-sm bg-[#e84978]/20" />
                      <div className="h-3 w-3 rounded-sm bg-[#e84978]/40" />
                      <div className="h-3 w-3 rounded-sm bg-[#e84978]/70" />
                      <div className="h-3 w-3 rounded-sm bg-[#e84978]" />
                    </div>
                    <span>çok</span>
                  </div>
                  <div className="flex items-center gap-3 text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#e84978] animate-pulse" />
                      <span>bugün</span>
                    </span>
                    <span className="text-zinc-700">·</span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-sm bg-white/5" />
                      <span>hafta sonu</span>
                    </span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/8 pt-3">
                  {[
                    { date: "14 Mayıs", count: 12, tone: "text-[#ff6e98]" },
                    { date: "Haziran 18", count: 11, tone: "text-[#ff6e98]" },
                    { date: "Mart 22", count: 9, tone: "text-amber-300" }
                  ].map((peak) => (
                    <div key={peak.date} className="rounded-lg border border-white/5 bg-black/30 p-2">
                      <div className="font-mono text-[8px] uppercase tracking-widest text-zinc-500">Zirve</div>
                      <div className={`text-xl font-black ${peak.tone}`}>{peak.count}</div>
                      <div className="font-mono text-[8px] text-zinc-500">{peak.date}</div>
                    </div>
                  ))}
                </div>
                <div className="absolute right-5 top-20 rounded-lg border border-[#e84978]/40 bg-[#0a0a14]/95 p-3 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,.5)]">
                  <div className="font-mono text-[8px] font-black uppercase tracking-widest text-[#e84978]">BUGÜN</div>
                  <div className="mt-1 text-sm font-black text-white">24 Haziran 2026</div>
                  <div className="mt-1 font-mono text-[9px] text-zinc-400">Çarşamba · 26. hafta</div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="text-2xl font-black text-[#e84978]">8</div>
                    <div className="font-mono text-[8px] text-zinc-500">onay<br/>bekliyor</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SOCIAL PROOF / MARKA SECTION */}
      <section id="referanslar" className="relative z-10 py-24 bg-[#0A0A0C]/50 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Switcher */}
          <div className="flex flex-col items-center gap-3 mb-14">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest font-mono">Marka Bölümü Tasarım Felsefesi:</span>
            <div className="flex flex-wrap justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 p-1.5 max-w-3xl">
              {[
                { n: 1, label: "1. Testimonial" },
                { n: 2, label: "2. Logo Duvarı" },
                { n: 3, label: "3. İstatistik" },
                { n: 4, label: "4. Marka Hikayeleri" }
              ].map((s) => (
                <button
                  key={s.n}
                  type="button"
                  onClick={() => setSelectedBrandStyle(s.n)}
                  className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold tracking-wide transition-all duration-300 ${
                    selectedBrandStyle === s.n
                      ? 'bg-[#e84978] text-white shadow-md shadow-pink-500/25 scale-105'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* VARYASYON 1: Testimonial Kartları */}
          {selectedBrandStyle === 1 && (
            <>
              <div className="text-center space-y-4 mb-20">
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">FOG İstanbul ile Çalışan 50+ Marka Tek Panelde</h2>
                <p className="text-zinc-400 max-w-md mx-auto text-[14px]">
                  İşte bizi tercih eden partnerlerimizin platformumuz hakkındaki görüşleri.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {[
                  { quote: "Eskiden her içerik onayı için en az 5 e-posta gidiyordu. Şimdi panelden tek tıkla onaylıyorum veya revizyonumu yazıyorum; ekibimiz haftada minimum 3 saat kazanıyor.", author: "Pazarlama Müdürü", company: "X Kozmetik A.Ş." },
                  { quote: "Reklam bütçemizin performansını, tıklama ve ROAS verilerimizi anlık görmek kararlarimizi çok hızlandırdı. Artık ay sonu raporu beklemek zorunda kalmıyoruz.", author: "CEO & Kurucu", company: "Y Mobilya Sanayi" }
                ].map((testi, index) => (
                  <div key={index} className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-6">
                    <div className="text-[#E24A75] text-4xl font-serif">"</div>
                    <p className="text-zinc-300 text-sm leading-relaxed italic mt-[-10px]">{testi.quote}</p>
                    <div className="border-t border-white/[0.05] pt-4">
                      <div className="text-white font-bold text-xs">{testi.author}</div>
                      <div className="text-zinc-500 text-[10px]">{testi.company}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* VARYASYON 2: Logo Duvarı + Featured Testimonial */}
          {selectedBrandStyle === 2 && (
            <>
              <div className="text-center space-y-4 mb-14">
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">50+ Marka FOG İstanbul'a Güveniyor</h2>
                <p className="text-zinc-400 max-w-2xl mx-auto text-[14px]">
                  Kurumsal markalardan e-ticaret devlerine, startup'lardan KOBİ'lere. Hepsini tek panelde yönetiyoruz.
                </p>
              </div>
              {/* Logo grid */}
              <div className="grid grid-cols-3 gap-3 md:grid-cols-6 max-w-5xl mx-auto mb-12">
                {[
                  { name: "X Kozmetik", tone: "from-pink-400 to-rose-500" },
                  { name: "Y Mobilya", tone: "from-amber-400 to-orange-500" },
                  { name: "Z Tekstil", tone: "from-emerald-400 to-teal-500" },
                  { name: "Q Lojistik", tone: "from-cyan-400 to-blue-500" },
                  { name: "W Müzik", tone: "from-violet-400 to-purple-500" },
                  { name: "R Otomotiv", tone: "from-rose-400 to-pink-500" },
                  { name: "K Eğitim", tone: "from-yellow-400 to-amber-500" },
                  { name: "S Finans", tone: "from-emerald-400 to-green-500" },
                  { name: "D Sağlık", tone: "from-sky-400 to-cyan-500" },
                  { name: "P Gastronomi", tone: "from-orange-400 to-red-500" },
                  { name: "L Hukuk", tone: "from-indigo-400 to-blue-500" },
                  { name: "B Turizm", tone: "from-pink-400 to-fuchsia-500" }
                ].map((brand) => (
                  <div key={brand.name} className="group relative aspect-video overflow-hidden rounded-lg border border-white/8 bg-black/30 transition-all hover:border-[#e84978]/40">
                    <div className={`absolute inset-0 bg-gradient-to-br ${brand.tone} opacity-15 group-hover:opacity-25 transition-opacity`} />
                    <div className="relative flex h-full items-center justify-center">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${brand.tone} text-xs font-black text-white`}>
                        {brand.name.charAt(0)}
                      </span>
                      <span className="ml-2 text-[10px] font-black text-white/80 truncate">{brand.name}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Featured testimonial */}
              <div className="max-w-3xl mx-auto">
                <div className="rounded-2xl border border-[#e84978]/30 bg-gradient-to-br from-[#e84978]/10 to-transparent p-8 text-center">
                  <div className="text-5xl text-[#e84978] font-serif mb-3">"</div>
                  <p className="text-zinc-200 text-base leading-relaxed italic mb-6">
                    FOG İstanbul'un paneli sayesinde tüm ajans süreçlerimizi tek yerden yönetiyoruz. İçerik onayından raporlamaya kadar her şey gözümüzün önünde.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-sm font-black text-white">A</div>
                    <div className="text-left">
                      <div className="text-sm font-black text-white">Ayşe K.</div>
                      <div className="text-[10px] text-zinc-500">Pazarlama Direktörü · X Kozmetik A.Ş.</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* VARYASYON 3: İstatistik Paneli */}
          {selectedBrandStyle === 3 && (
            <>
              <div className="text-center space-y-4 mb-14">
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Rakamlarla FOG İstanbul</h2>
                <p className="text-zinc-400 max-w-2xl mx-auto text-[14px]">
                  Müşterilerimizin başarıları, bizim başarımız.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 max-w-5xl mx-auto">
                {[
                  { v: "50+", l: "Aktif Marka", tone: "text-white", icon: "◉" },
                  { v: "4.9/5", l: "Müşteri Puanı", tone: "text-amber-300", icon: "★" },
                  { v: "247", l: "Aylık Onay", tone: "text-[#ff6e98]", icon: "✓" },
                  { v: "%98", l: "Memnuniyet", tone: "text-emerald-300", icon: "◈" }
                ].map((s) => (
                  <div key={s.l} className="rounded-2xl border border-white/8 bg-black/30 p-6 text-center transition-all hover:border-[#e84978]/30">
                    <div className="text-2xl text-[#e84978]/40 mb-2">{s.icon}</div>
                    <div className={`text-4xl font-black ${s.tone}`}>{s.v}</div>
                    <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">{s.l}</div>
                  </div>
                ))}
              </div>
              {/* Yıldız derecelendirme barı */}
              <div className="mt-10 max-w-3xl mx-auto rounded-2xl border border-white/8 bg-black/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-3xl font-black text-white">4.9 / 5.0</div>
                    <div className="mt-1 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <svg key={i} viewBox="0 0 16 16" className={`h-4 w-4 ${i <= 4 ? "text-amber-300" : "text-amber-300/50"}`} fill="currentColor">
                          <path d="M8 1 L10 6 L15 6 L11 9 L13 14 L8 11 L3 14 L5 9 L1 6 L6 6 Z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className="text-right text-[10px] font-mono uppercase tracking-widest text-zinc-500">228 değerlendirme</div>
                </div>
                <div className="space-y-1.5">
                  {[
                    { s: 5, w: 78 },
                    { s: 4, w: 16 },
                    { s: 3, w: 4 },
                    { s: 2, w: 1 },
                    { s: 1, w: 1 }
                  ].map((r) => (
                    <div key={r.s} className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-zinc-500 w-3">{r.s}★</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full bg-gradient-to-r from-amber-400 to-amber-300" style={{ width: `${r.w}%` }} />
                      </div>
                      <span className="font-mono text-[10px] text-zinc-400 w-9 text-right">{r.w}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* VARYASYON 4: Marka Hikayeleri */}
          {selectedBrandStyle === 4 && (
            <>
              <div className="text-center space-y-4 mb-14">
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Markaların FOG Hikayesi</h2>
                <p className="text-zinc-400 max-w-2xl mx-auto text-[14px]">
                  Gerçek sonuçlar, gerçek markalar.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-6xl mx-auto">
                {[
                  {
                    name: "X Kozmetik",
                    sector: "Kozmetik · E-ticaret",
                    tone: "from-pink-400 to-rose-500",
                    metric: "%38 ↑",
                    metricLabel: "Erişim Artışı",
                    quote: "3 ayda ROAS'umuz 2.4x'ten 4.8x'e çıktı.",
                    person: "Ayşe K. · Pazarlama Direktörü"
                  },
                  {
                    name: "Y Mobilya",
                    sector: "Mobilya · Kurumsal",
                    tone: "from-amber-400 to-orange-500",
                    metric: "12 saat/hafta",
                    metricLabel: "Zaman Tasarrufu",
                    quote: "Tüm ajans işimizi tek panelden yönetiyoruz.",
                    person: "Mehmet T. · CEO"
                  },
                  {
                    name: "Z Tekstil",
                    sector: "Tekstil · Startup",
                    tone: "from-emerald-400 to-teal-500",
                    metric: "%62 ↑",
                    metricLabel: "İçerik Hızı",
                    quote: "İçerik üretim hızımız 3 katına çıktı.",
                    person: "Zeynep D. · Kurucu Ortak"
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
          )}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="sss" className="relative z-10 py-24 max-w-7xl mx-auto px-6 border-t border-white/[0.04]">
        {/* Switcher */}
        <div className="flex flex-col items-center gap-3 mb-12">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest font-mono">SSS Tasarım Felsefesi:</span>
          <div className="flex flex-wrap justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 p-1.5 max-w-3xl">
            {[
              { n: 1, label: "1. Klasik Akordion" },
              { n: 2, label: "2. 2 Kolonlu" },
              { n: 3, label: "3. Sekmeli" },
              { n: 4, label: "4. Arama Çubuklu" }
            ].map((s) => (
              <button
                key={s.n}
                type="button"
                onClick={() => setSelectedFAQStyle(s.n)}
                className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold tracking-wide transition-all duration-300 ${
                  selectedFAQStyle === s.n
                    ? 'bg-[#e84978] text-white shadow-md shadow-pink-500/25 scale-105'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* VARYASYON 1: Klasik Akordion */}
        {selectedFAQStyle === 1 && (
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
        )}

        {/* VARYASYON 2: 2 Kolonlu Grid */}
        {selectedFAQStyle === 2 && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-[#E24A75] text-[11px] font-semibold uppercase tracking-wider">Yardım</div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Sıkça Sorulan Sorular</h2>
              <p className="text-zinc-400 text-sm">Çift kolonlu yapı: bir göz atın, ilginizi çekene tıklayın.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {faqs.map((faq, index) => {
                const isOpen = activeFAQ === index;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveFAQ(isOpen ? null : index)}
                    className={`group relative rounded-2xl border bg-black/30 p-5 text-left transition-all hover:border-[#e84978]/40 ${
                      isOpen ? "border-[#e84978]/60 bg-[#e84978]/5" : "border-white/8"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-[10px] font-black ${
                        isOpen ? "bg-[#e84978] text-white" : "bg-white/5 text-zinc-500"
                      }`}>
                        Q{String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1">
                        <div className={`text-sm font-bold ${isOpen ? "text-white" : "text-zinc-200 group-hover:text-white"}`}>{faq.q}</div>
                        {isOpen && (
                          <div className="mt-3 text-xs text-zinc-400 leading-relaxed border-t border-white/8 pt-3">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* VARYASYON 3: Sekmeli Kategorili */}
        {selectedFAQStyle === 3 && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-[#E24A75] text-[11px] font-semibold uppercase tracking-wider">Yardım</div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Sıkça Sorulan Sorular</h2>
              <p className="text-zinc-400 text-sm">Kategorilere göre gruplandırılmış cevaplar.</p>
            </div>
            {/* Kategori sekmeleri */}
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {[
                { n: 1, label: "Genel", count: 2 },
                { n: 2, label: "Fiyat", count: 1 },
                { n: 3, label: "Teknik", count: 1 },
                { n: 4, label: "Güvenlik", count: 1 }
              ].map((tab) => (
                <button
                  key={tab.n}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                    tab.n === 1 ? "bg-[#e84978] text-white shadow-md shadow-pink-500/25" : "border border-white/10 bg-black/30 text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {tab.label} <span className="ml-1 text-[10px] opacity-70">{tab.count}</span>
                </button>
              ))}
            </div>
            {/* İçerik - sadece Genel kategorisi gösterilir */}
            <div className="space-y-3">
              {faqs.slice(0, 2).map((faq, index) => {
                const isOpen = activeFAQ === index;
                return (
                  <div key={index} className="rounded-2xl border border-white/8 bg-black/30 p-5">
                    <button
                      type="button"
                      onClick={() => setActiveFAQ(isOpen ? null : index)}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#e84978]/15 font-mono text-[10px] font-black text-[#ff6e98]">{String(index + 1).padStart(2, "0")}</span>
                        <span className="text-sm font-bold text-white">{faq.q}</span>
                      </span>
                      {isOpen ? <Minus className="h-4 w-4 text-[#e84978]" /> : <Plus className="h-4 w-4 text-zinc-500" />}
                    </button>
                    {isOpen && <p className="mt-3 border-t border-white/8 pt-3 text-xs text-zinc-400 leading-relaxed">{faq.a}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VARYASYON 4: Arama Çubuklu */}
        {selectedFAQStyle === 4 && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center space-y-4 mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-[#E24A75] text-[11px] font-semibold uppercase tracking-wider">Yardım</div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Size nasıl yardımcı olabiliriz?</h2>
              <p className="text-zinc-400 text-sm">Aşağıdaki arama ile hemen cevabı bulun.</p>
            </div>
            {/* Arama input */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-4 flex items-center text-zinc-500">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
              </div>
              <input
                type="text"
                placeholder="Soru ara… (ör: fiyat, panel, SSL)"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-12 py-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#e84978]/50"
              />
              <span className="absolute inset-y-0 right-4 flex items-center font-mono text-[10px] text-zinc-600">⌘K</span>
            </div>
            {/* Popüler etiketler */}
            <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Popüler:</span>
              {["Panel giriş", "Fiyatlandırma", "ROAS", "Veri güvenliği", "Onay süreci"].map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold text-zinc-300 hover:border-[#e84978]/40 hover:text-white cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>
            {/* Sonuç listesi */}
            <div className="space-y-2">
              <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">5 sonuç</div>
              {faqs.map((faq, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFAQ(activeFAQ === index ? null : index)}
                  className={`group w-full rounded-xl border bg-black/30 p-4 text-left transition-all hover:border-[#e84978]/40 ${
                    activeFAQ === index ? "border-[#e84978]/60 bg-[#e84978]/5" : "border-white/8"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-[#e84978]" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.8 1 6.5 2.6" /></svg>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white">{faq.q}</div>
                      {activeFAQ === index && <div className="mt-2 text-xs text-zinc-400 leading-relaxed">{faq.a}</div>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* CALL TO ACTION (CTA) SECTION */}
      <section className="relative z-10 py-16 max-w-7xl mx-auto px-6">
        {/* Switcher */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest font-mono">CTA Tasarım Felsefesi:</span>
          <div className="flex flex-wrap justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 p-1.5 max-w-3xl">
            {[
              { n: 1, label: "1. Klasik Kart" },
              { n: 2, label: "2. 2 Kolonlu" },
              { n: 3, label: "3. Floating 3D" },
              { n: 4, label: "4. Sosyal Kanıt" }
            ].map((s) => (
              <button
                key={s.n}
                type="button"
                onClick={() => setSelectedCTAStyle(s.n)}
                className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold tracking-wide transition-all duration-300 ${
                  selectedCTAStyle === s.n
                    ? 'bg-[#e84978] text-white shadow-md shadow-pink-500/25 scale-105'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* VARYASYON 1: Klasik Kart */}
        {selectedCTAStyle === 1 && (
          <div className="relative rounded-3xl overflow-hidden p-8 md:p-16 text-center space-y-8 bg-gradient-to-r from-[#E24A75]/20 to-amber-600/10 border border-[#E24A75]/35 shadow-[0_0_50px_rgba(226,74,117,0.1)]">
            <div className="absolute inset-0 bg-[#0A0A0C]/40 mix-blend-overlay z-0" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                Bir Sonraki Büyük Projeniz<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-amber-500">Burada Başlıyor</span>
              </h2>
              <p className="text-zinc-300 text-sm leading-relaxed">
                FOG İstanbul ile süreçlerinizi şeffaf, ölçülebilir ve hızlı bir şekilde yönetin. Müşteri portalımıza hemen katılarak büyümenizi başlatın.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button onClick={handlePortalRedirect} className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-black hover:bg-[#E24A75] hover:text-white font-bold transition-all duration-300 shadow-xl active:scale-[0.98] text-[13px]">Hemen Başla</button>
                <button onClick={() => { const el = document.getElementById('iletisim'); el?.scrollIntoView({ behavior: 'smooth' }); }} className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all duration-300 active:scale-[0.98] text-[13px]">Bizimle İletişime Geçin</button>
              </div>
            </div>
          </div>
        )}

        {/* VARYASYON 2: 2 Kolonlu (Sol metin, sağ e-posta formu) */}
        {selectedCTAStyle === 2 && (
          <div className="relative grid items-center gap-10 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-8 md:p-12 lg:grid-cols-2 md:gap-14">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(232,73,120,.10),transparent_50%)]" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e84978]/30 bg-[#e84978]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#ff9db8]">
                Hemen Başla
              </span>
              <h2 className="mt-4 text-3xl md:text-4xl font-black leading-[0.95] tracking-tight text-white">
                Panele giriş yapın,<br/>
                <span className="bg-gradient-to-r from-pink-400 to-amber-500 bg-clip-text text-transparent">gözünüz önünde.</span>
              </h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                E-postanızı bırakın, 5 dakika içinde hesabınız hazır. Kredi kartı gerekmez, 14 gün ücretsiz deneyin.
              </p>
              <ul className="mt-6 space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2"><span className="text-emerald-300">✓</span> 50+ marka tarafından kullanılıyor</li>
                <li className="flex items-center gap-2"><span className="text-emerald-300">✓</span> KVKK & GDPR uyumlu</li>
                <li className="flex items-center gap-2"><span className="text-emerald-300">✓</span> Kurulum yok, anında başlayın</li>
              </ul>
            </div>
            <div className="relative rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
              <div className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-500 mb-3">Hızlı Kayıt</div>
              <div className="space-y-3">
                <input type="text" placeholder="Ad Soyad" className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#e84978]/50" />
                <input type="email" placeholder="E-posta adresi" className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#e84978]/50" />
                <input type="text" placeholder="Şirket adı" className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#e84978]/50" />
                <button className="w-full rounded-lg bg-gradient-to-r from-[#e84978] to-amber-500 py-3 text-sm font-black uppercase tracking-widest text-white shadow-[0_0_30px_rgba(232,73,120,.5)] hover:shadow-[0_0_40px_rgba(232,73,120,.7)]">
                  Ücretsiz Dene →
                </button>
                <div className="text-center text-[10px] text-zinc-500">
                  Kayıt olarak <a href="#" className="text-[#ff9db8] underline">şartları</a> kabul edersiniz.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VARYASYON 3: Floating 3D */}
        {selectedCTAStyle === 3 && (
          <div className="relative overflow-hidden rounded-3xl border border-[#e84978]/30 bg-gradient-to-br from-[#1a0c14] via-[#08080c] to-[#0a0a14] p-8 md:p-14" style={{ perspective: "1200px" }}>
            {/* Yüzen 3D parçacıklar */}
            <motion.div
              className="pointer-events-none absolute left-[10%] top-[20%] h-16 w-16 rounded-2xl bg-gradient-to-br from-[#e84978] to-amber-300 opacity-30 blur-xl"
              animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="pointer-events-none absolute right-[15%] top-[60%] h-20 w-20 rounded-full bg-gradient-to-br from-emerald-300 to-cyan-300 opacity-25 blur-2xl"
              animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="pointer-events-none absolute right-[8%] top-[15%] h-12 w-12 rounded-lg bg-gradient-to-br from-violet-300 to-pink-300 opacity-30 blur-lg"
              animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative grid items-center gap-8 md:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#e84978]/30 bg-[#e84978]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#ff9db8]">
                  ✦ Sınırlı Kontenjan
                </span>
                <h2 className="mt-4 text-3xl md:text-5xl font-black leading-[0.95] tracking-tight text-white">
                  Harekete<br/>
                  <span className="bg-gradient-to-r from-pink-400 via-amber-300 to-white bg-clip-text text-transparent">geçin.</span>
                </h2>
                <p className="mt-4 text-sm leading-7 text-zinc-400 max-w-md">
                  FOG İstanbul Müşteri Portalı ile içerik onayı, raporlama ve iletişim tek ekranda. Hemen katılın, farkı ilk gün görün.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button onClick={handlePortalRedirect} className="rounded-xl bg-gradient-to-r from-[#e84978] to-amber-500 px-7 py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-[0_0_40px_rgba(232,73,120,.5)] hover:shadow-[0_0_60px_rgba(232,73,120,.7)] transition-all">
                    Ücretsiz Başla →
                  </button>
                  <button className="rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-all">
                    Demo İzle
                  </button>
                </div>
              </div>
              <div className="relative" style={{ transformStyle: "preserve-3d" }}>
                <div
                  className="relative rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-[0_30px_80px_rgba(0,0,0,.5),inset_0_1px_0_rgba(255,255,255,.2)] backdrop-blur-md"
                  style={{ transform: "rotateY(-8deg) rotateX(4deg)" }}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-2xl bg-gradient-to-b from-white/15 to-transparent" />
                  <div className="relative">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#e84978] to-amber-300 text-lg font-black text-white">F</div>
                      <div>
                        <div className="text-sm font-black text-white">FOG Portal</div>
                        <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">crm.fogistanbul.com</div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {[
                        { l: "Aktif iş", v: "18", tone: "bg-emerald-300" },
                        { l: "Onay bekleyen", v: "5", tone: "bg-amber-300" },
                        { l: "ROAS", v: "4.8x", tone: "bg-[#e84978]" }
                      ].map((m) => (
                        <div key={m.l} className="flex items-center justify-between rounded-lg border border-white/8 bg-black/30 px-3 py-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`h-1.5 w-1.5 rounded-full ${m.tone}`} />
                            <span className="text-zinc-300">{m.l}</span>
                          </div>
                          <span className="font-mono text-white font-black">{m.v}</span>
                        </div>
                      ))}
                    </div>
                    <button className="mt-4 w-full rounded-lg bg-[#e84978] py-2 text-xs font-black uppercase tracking-widest text-white">
                      Panele Git →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VARYASYON 4: Sosyal Kanıt + Aksiyon */}
        {selectedCTAStyle === 4 && (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0a0a14] to-[#08080c] p-8 md:p-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(232,73,120,.15),transparent_50%)]" />
            <div className="relative max-w-4xl mx-auto text-center">
              {/* Avatarlar */}
              <div className="mb-6 flex items-center justify-center">
                <div className="flex -space-x-3">
                  {["from-pink-400 to-rose-500", "from-amber-400 to-orange-500", "from-emerald-400 to-teal-500", "from-cyan-400 to-blue-500", "from-violet-400 to-purple-500"].map((g, i) => (
                    <div key={i} className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0a0a14] bg-gradient-to-br ${g} text-xs font-black text-white`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0a0a14] bg-white/10 text-[10px] font-black text-white">
                    +45
                  </div>
                </div>
              </div>
              {/* Yıldız puanı */}
              <div className="mb-2 flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} viewBox="0 0 16 16" className="h-4 w-4 text-amber-300" fill="currentColor">
                    <path d="M8 1 L10 6 L15 6 L11 9 L13 14 L8 11 L3 14 L5 9 L1 6 L6 6 Z" />
                  </svg>
                ))}
                <span className="ml-2 text-xs font-black text-white">4.9</span>
                <span className="ml-1 text-[10px] text-zinc-500">(228 değerlendirme)</span>
              </div>
              <h2 className="mt-4 text-3xl md:text-5xl font-black leading-[0.95] tracking-tight text-white">
                50+ Marka Arasına<br/>
                <span className="bg-gradient-to-r from-pink-400 to-amber-500 bg-clip-text text-transparent">Sen de Katıl</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-400">
                FOG İstanbul, ajans-müşteri ilişkisini şeffaf ve ölçülebilir hale getiriyor. 14 gün ücretsiz dene, farkı gör.
              </p>
              {/* Trust badges */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                <span className="rounded border border-white/10 bg-white/5 px-2 py-1">KVKK</span>
                <span className="rounded border border-white/10 bg-white/5 px-2 py-1">GDPR</span>
                <span className="rounded border border-white/10 bg-white/5 px-2 py-1">SSL 256-bit</span>
                <span className="rounded border border-white/10 bg-white/5 px-2 py-1">ISO 27001</span>
              </div>
              {/* CTA butonları */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button onClick={handlePortalRedirect} className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-[#e84978] to-amber-500 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-[0_0_40px_rgba(232,73,120,.5)] hover:scale-105 transition-all">
                  Hemen Ücretsiz Başla →
                </button>
                <button onClick={() => { const el = document.getElementById('iletisim'); el?.scrollIntoView({ behavior: 'smooth' }); }} className="w-full sm:w-auto rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-bold text-white hover:bg-white/10 transition-all">
                  Satış ile Görüş
                </button>
              </div>
              <div className="mt-4 text-[10px] text-zinc-500">
                Kredi kartı gerekmez · 2 dakikada kurulum
              </div>
            </div>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer id="iletisim" className="relative z-10 bg-[#050507] border-t border-white/[0.05] pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 pb-16">
          
          <div className="md:col-span-4 space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              FOG
              <span className="text-zinc-500 font-light text-[11px] tracking-[0.25em] uppercase mt-1">Istanbul</span>
            </h2>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-sm">
              Markaların dijital varlıklarını en şeffaf ve ölçülebilir araçlarla büyüten yeni nesil dijital ajans ve SaaS ekosistemi.
            </p>
            <div className="text-[10px] text-zinc-600">
              © 2026 FOG İstanbul Dijital Ajans. Tüm hakları saklıdır.
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Menü</h4>
            <ul className="space-y-2 text-xs text-zinc-500">
              <li><a href="#hakkimizda" className="hover:text-white transition-colors">Hakkımızda</a></li>
              <li><a href="#hizmetler" className="hover:text-white transition-colors">Hizmetler</a></li>
              <li><a href="#portfolyo" className="hover:text-white transition-colors">Portfolyo</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">SSS</a></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Sözleşmeler</h4>
            <ul className="space-y-2 text-xs text-zinc-500">
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Gizlilik Politikası</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Kullanım Şartları</Link></li>
              <li><Link to="/cookie-policy" className="hover:text-white transition-colors">Çerez Politikası</Link></li>
              <li><Link to="/dpa" className="hover:text-white transition-colors">Veri İşleme Sözleşmesi (DPA)</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold tracking-widest text-zinc-400 uppercase">İletişim</h4>
            <ul className="space-y-3 text-xs text-zinc-500">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#E24A75] shrink-0" />
                <span>info@fogistanbul.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#E24A75] shrink-0" />
                <span>+90 (212) 000 00 00</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#E24A75] shrink-0 mt-0.5" />
                <span>Maslak, Büyükdere Cad. No:85, Sarıyer / İstanbul</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-white/[0.03] pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-zinc-700">
          <div>GDPR & KVKK Uyumlu Altyapı</div>
          <div>Design inspired by FOG Istanbul Visual System</div>
        </div>
      </footer>
    </div>
  );
}
