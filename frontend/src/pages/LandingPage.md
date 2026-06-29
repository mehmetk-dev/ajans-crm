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
            <a className="transition hover:text-white" href="#nasil-calisir">Nasıl Çalışır?</a>
            <a className="transition hover:text-white" href="#ozellikler">Özellikler</a>
            <a className="transition hover:text-white" href="#referanslar">Referanslar</a>
            <a className="transition hover:text-white" href="#sss">SSS</a>
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
                <a href="#nasil-calisir" onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-white transition-colors">Nasıl Çalışır?</a>
                <a href="#ozellikler" onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-white transition-colors">Özellikler</a>
                <a href="#referanslar" onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-white transition-colors">Referanslar</a>
                <a href="#sss" onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-white transition-colors">SSS</a>
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

            {/* Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="relative max-w-5xl mx-auto"
            >
              <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl overflow-hidden shadow-2xl shadow-white/5">
                {/* Browser Chrome */}
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

                {/* Dashboard body */}
                <div className="grid gap-3 p-5 md:grid-cols-12 text-left">
                  {/* Sidebar */}
                  <div className="hidden space-y-2 rounded-lg border border-white/5 bg-white/[0.02] p-3 md:col-span-3 md:block">
                    {['Anasayfa', 'Görevler', 'İçerikler', 'Reklamlar', 'Sosyal Medya', 'Çekimler', 'Mesajlar', 'Raporlar'].map(
                      (item, i) => (
                        <div
                          key={item}
                          className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs ${
                            i === 0 ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-gray-600'}`} />
                          {item}
                        </div>
                      )
                    )}
                  </div>

                  {/* Content area */}
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
                { n: 2, label: "2. Interactive Timeline" },
                { n: 3, label: "3. Neo-Brutalist Poster" },
                { n: 4, label: "4. Glassmorphic Deck" },
                { n: 5, label: "5. Swiss Editorial" },
                { n: 6, label: "6. Diagnostic Terminal" },
                { n: 7, label: "7. Bento Mockup Dashboard" }
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
                              {/* VARYASYON 2: Horizontal Filmstrip Cinematic Slider */}
          {selectedAboutStyle === 2 && (
            <div className="max-w-4xl mx-auto rounded-[3rem] border border-white/[0.08] bg-[#121217]/50 backdrop-blur-xl p-10 md:p-16 relative overflow-hidden shadow-2xl min-h-[400px] flex flex-col justify-between text-left">
              <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/5 rounded-full blur-[140px] pointer-events-none animate-pulse" />
              
              <div className="flex justify-between items-center pb-8 border-b border-white/5">
                <span className="text-[10px] font-bold text-[#e84978] tracking-widest font-mono uppercase">KONSEPT SLIDER // 0{aboutTimelineStep + 1}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAboutTimelineStep((prev) => (prev === 0 ? 3 : prev - 1))}
                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:border-[#e84978] hover:text-white transition-all duration-300"
                  >
                    &larr;
                  </button>
                  <button
                    type="button"
                    onClick={() => setAboutTimelineStep((prev) => (prev === 3 ? 0 : prev + 1))}
                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:border-[#e84978] hover:text-white transition-all duration-300"
                  >
                    &rarr;
                  </button>
                </div>
              </div>

              <div className="py-8 space-y-6">
                <h3 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase leading-none">
                  {aboutTimelineStep === 0 && "01. Keşif & Analiz"}
                  {aboutTimelineStep === 1 && "02. Strateji"}
                  {aboutTimelineStep === 2 && "03. Şeffaflık"}
                  {aboutTimelineStep === 3 && "04. ROI Odaklı"}
                </h3>
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-2xl font-sans">
                  {aboutTimelineStep === 0 && "Ajansımızla iş birliğine başladığınızda varsayımlarla değil, gerçek verilerle yola çıkarız. Tüm sosyal medya hesaplarınızı, reklam hesaplarınızı ve arama görünürlüğünüzü analiz ederek dijital boşluklarınızı ve büyüme potansiyellerinizi şeffafça belirleriz."}
                  {aboutTimelineStep === 1 && "Markanızın hedeflerine ve bütçesine en uygun dijital pazarlama, içerik üretimi ve reklam stratejilerini kurgularız. Yol haritamızdaki her adım net, ölçülebilir ve önceden onaylı şekilde belirlenir."}
                  {aboutTimelineStep === 2 && "WhatsApp gruplarında kaybolan taleplere, mail kaoslarına son veriyoruz. Yapılan tüm işleri, onay bekleyen tasarımları ve harcamaları tek panelden 7/24 izleyebilirsiniz."}
                  {aboutTimelineStep === 3 && "Reklamların performansını, içeriklerimizin erişim oranlarını anlık olarak izler ve düzenli optimizasyonlarla getiriyi en üst düzeye çıkarırız. Her ay sonu detaylı analiz raporları ile performansımızı sunarız."}
                </p>
              </div>

              <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                {/* Horizontal bar indicator */}
                <div className="flex gap-1.5 items-center">
                  {[0, 1, 2, 3].map((idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAboutTimelineStep(idx)}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        aboutTimelineStep === idx ? 'w-8 bg-[#e84978]' : 'w-2 bg-white/10 hover:bg-white/20'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">FOG ISTANBUL SLIDESHOW SYSTEM</span>
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

          {/* VARYASYON 4: Interactive Isometric Floating Orbs */}
          {selectedAboutStyle === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left py-12 relative min-h-[400px]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/5 rounded-full blur-[120px] pointer-events-none" />
              
              {[
                {
                  title: "Sınırsız Vizyon",
                  meta: "VİZYON // 01",
                  rotate: "rotate-2 hover:rotate-0 hover:scale-[1.04]",
                  desc: "Biz, veriye inanan, şeffaflığı savunan ve hızı iş süreçlerinin odağına koyan yeni nesil bir dijital ajansız. İş ortaklarımızın büyümesini kendi büyümemiz kabul ederiz."
                },
                {
                  title: "Gerçek Misyon",
                  meta: "MİSYON // 02",
                  rotate: "-rotate-2 hover:rotate-0 hover:scale-[1.04]",
                  desc: "Dijital reklam yönetimi, SEO, sosyal medya ve web tasarım alanlarında uçtan uca hizmet veriyoruz. Ancak sadece iş üretmiyor, ürettiğimiz tüm işlerin takibini şeffaf portalımızla sunuyoruz."
                },
                {
                  title: "Teknolojik Fark",
                  meta: "FARKIMIZ // 03",
                  rotate: "rotate-1 hover:rotate-0 hover:scale-[1.04]",
                  desc: "Müşterilerimizi hiçbir zaman belirsizlikte bırakmıyoruz. WhatsApp veya e-posta karmaşası yerine özel yazılımımızla anlık iletişim kuruyor, süreci anbean takip ettiriyoruz."
                }
              ].map((card, idx) => (
                <div
                  key={idx}
                  className={`p-8 rounded-[2.5rem] border border-white/10 bg-[#121217]/50 backdrop-blur-xl shadow-2xl transition-all duration-500 flex flex-col justify-between min-h-[320px] group ${card.rotate}`}
                >
                  <div className="space-y-6">
                    <span className="text-[10px] font-bold tracking-widest text-[#e84978] uppercase font-mono block">
                      {card.meta}
                    </span>
                    <h3 className="text-xl font-extrabold text-white group-hover:text-[#e84978] transition-colors duration-300">
                      {card.title}
                    </h3>
                    <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                      {card.desc}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                    <span>FOG CORE</span>
                    <span>ACTIVE</span>
                  </div>
                </div>
              ))}
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

          {/* VARYASYON 6: The 3D Isometric Stack Deck */}
          {selectedAboutStyle === 6 && (
            <div className="flex flex-col items-center py-16">
              <div className="relative w-full max-w-md h-[340px] [perspective:1200px] flex items-center justify-center">
                
                {[
                  {
                    title: "Çevik İletişim Gücü",
                    desc: "WhatsApp gruplarında ve maillerde kaybolan revizyonlara son veriyoruz. Tüm onay süreçleri portal içinde anlık mesajlaşma ile yönetilir.",
                    z: "z-10 opacity-60 translate-y-12 -translate-x-12 scale-95 border-white/5 bg-[#121217]/60 rotate-6 hover:translate-y-6 hover:-translate-x-16 hover:opacity-100 duration-300",
                    num: "03"
                  },
                  {
                    title: "Veri Odaklı Karar",
                    desc: "Stratejimizi varsayımlarla değil; A/B testleri, Google Analytics ve Search Console verilerini entegre ederek kurguluyoruz.",
                    z: "z-20 opacity-80 translate-y-6 -translate-x-6 scale-98 border-white/10 bg-[#121217]/80 -rotate-3 hover:translate-y-0 hover:-translate-x-10 hover:opacity-100 duration-300",
                    num: "02"
                  },
                  {
                    title: "Sınırsız Şeffaflık",
                    desc: "FOG Müşteri Portalı ile tüm görevleri, tasarımları, onay aşamalarını ve reklam harcamalarını 7/24 anlık izleyebilirsiniz.",
                    z: "z-30 opacity-100 translate-y-0 translate-x-0 scale-100 border-[#e84978] bg-[#121217] rotate-2 hover:scale-[1.03] duration-300",
                    num: "01"
                  }
                ].map((card, idx) => (
                  <div
                    key={idx}
                    className={`absolute w-[290px] md:w-[320px] h-[240px] p-6 rounded-3xl border text-left shadow-2xl flex flex-col justify-between transition-all ease-out cursor-pointer ${card.z}`}
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-[#e84978] font-mono tracking-widest">FOG PILLAR</span>
                        <span className="text-xs font-mono font-bold text-zinc-600">0{card.num}</span>
                      </div>
                      <h4 className="text-md font-bold text-white tracking-tight">{card.title}</h4>
                      <p className="text-zinc-400 text-[11px] leading-relaxed font-sans">{card.desc}</p>
                    </div>
                    <div className="text-[8px] text-zinc-500 font-mono tracking-widest">TACTILE STACK DECK // INTEGRATED</div>
                  </div>
                ))}

              </div>
              <p className="text-xs text-zinc-500 mt-8 font-mono">Kartların üzerine gelerek 3D katmanları inceleyebilirsiniz</p>
            </div>
          )}

          {/* VARYASYON 7: Interactive Stats Dial Wheel */}
          {selectedAboutStyle === 7 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
              {/* Radial Dial Wheel on Left */}
              <div className="lg:col-span-5 flex items-center justify-center">
                <div className="relative w-[280px] h-[280px] rounded-full border border-white/5 bg-white/[0.01] flex items-center justify-center">
                  
                  {/* Rotating pointer line */}
                  <div
                    style={{
                      transform: `rotate(${aboutTimelineStep * 90}deg)`
                    }}
                    className="absolute w-full h-full rounded-full transition-transform duration-700 ease-in-out pointer-events-none"
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-1/2 bg-gradient-to-t from-transparent to-[#e84978] shadow-[0_0_15px_rgba(232,73,120,0.6)]" />
                  </div>

                  {/* Central Display */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#121217] to-zinc-950 border border-white/10 flex flex-col items-center justify-center z-10 text-center shadow-inner">
                    <span className="text-xs font-black tracking-widest text-[#e84978] font-mono">
                      {[
                        "35+",
                        "120M+",
                        "%300",
                        "0 Kaos"
                      ][aboutTimelineStep % 4]}
                    </span>
                    <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest mt-1">GÖSTERGE</span>
                  </div>

                  {/* 4 Interactive selectors */}
                  {[
                    { id: 0, angle: 0, label: "Kadro" },
                    { id: 1, angle: 90, label: "Erişim" },
                    { id: 2, angle: 180, label: "ROI" },
                    { id: 3, angle: 270, label: "İletişim" }
                  ].map((node) => {
                    const angleRad = (node.angle * Math.PI) / 180;
                    const radius = 95;
                    const isActive = aboutTimelineStep % 4 === node.id;
                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => setAboutTimelineStep(node.id)}
                        style={{
                          transform: `translate(${Math.cos(angleRad) * radius}px, ${Math.sin(angleRad) * radius}px)`
                        }}
                        className={`absolute w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all duration-300 z-20 border ${
                          isActive
                            ? 'bg-[#e84978] border-none text-white scale-110 shadow-[0_0_15px_rgba(232,73,120,0.4)]'
                            : 'bg-[#121217] border-white/10 text-zinc-400 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        <span className="text-[8px] font-bold tracking-wider font-mono">{node.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Explanatory Panel on Right */}
              <div className="lg:col-span-7">
                <div className="rounded-[2.5rem] border border-white/[0.08] bg-[#121217]/50 backdrop-blur-xl p-8 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#e84978]/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="space-y-6 relative z-10">
                    <span className="text-[10px] font-bold text-[#e84978] uppercase tracking-widest font-mono">GÖSTERGE RASYOSU</span>
                    
                    <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white uppercase">
                      {[
                        "Profesyonel Ekip Gücü",
                        "Nitelikli Erişim Hacmi",
                        "Ortalama ROI Büyümesi",
                        "Karmaşasız İletişim Güvencesi"
                      ][aboutTimelineStep % 4]}
                    </h3>

                    <p className="text-zinc-400 text-sm leading-relaxed font-sans">
                      {[
                        "FOG İstanbul bünyesinde görev yapan her biri kendi disiplininde uzman, sertifikalı dijital pazarlama, tasarım ve SEO ekibimizle markanızın her operasyonunu profesyonelce yönetiyoruz.",
                        "Sosyal medya reklamlarında bütçenizi boşa harcamıyoruz. Doğru kitle hedeflemeleri ve analitik entegrasyonlar ile reklamlarınızı satın alma eğilimi en yüksek kitlelere ulaştırıyoruz.",
                        "İş ortaklarımızın dijital dönüşüm verilerini anlık takip ederek, dönüşüm başına maliyetleri optimize ediyor ve genel büyüme oranlarını ortalama 3 katına çıkarıyoruz.",
                        "Tüm süreçlerinizi tek bir platformdan yönetin. Görev durumları, revizyon onay akışları ve doğrudan ekip sohbet kanalları ile iş takibinde sıfır kaos sağlıyoruz."
                      ][aboutTimelineStep % 4]}
                    </p>

                    <div className="pt-6 border-t border-white/5 text-[9px] text-zinc-500 font-mono tracking-widest uppercase">
                      SAYISAL_DOĞRULAMA_MATRİSİ
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}�n dijital dönüşüm verilerini anlık takip ederek, dönüşüm başına maliyetleri düşürüyor, satışlarınızı ve genel dijital görünürlüğünüzü ortalama 3 katına çıkarıyoruz.",
                        "Tüm süreçlerinizi tek bir platformdan yönetmenin rahatlığını yaşayın. İş takibi, onay akışları ve doğrudan ekip sohbet kanalları ile ajansınız hep yanınızda."
                      ][aboutTimelineStep % 4]}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 text-[10px] text-zinc-500 font-mono uppercase tracking-widest relative z-10">
                  METRİK_KANIT_SİSTEMİ
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
      </section>

      {/* SOCIAL PROOF / CLIENT FEEDBACK */}
      <section id="referanslar" className="relative z-10 py-24 bg-[#0A0A0C]/50 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">FOG İstanbul ile Çalışan 50+ Marka Tek Panelde</h2>
            <p className="text-zinc-400 max-w-md mx-auto text-[14px]">
              İşte bizi tercih eden partnerlerimizin platformumuz hakkındaki görüşleri.
            </p>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                quote: "Eskiden her içerik onayı için en az 5 e-posta gidiyordu. Şimdi panelden tek tıkla onaylıyorum veya revizyonumu yazıyorum; ekibimiz haftada minimum 3 saat kazanıyor.",
                author: "Pazarlama Müdürü",
                company: "X Kozmetik A.Ş."
              },
              {
                quote: "Reklam bütçemizin performansını, tıklama ve ROAS verilerimizi anlık görmek kararlarimizi çok hızlandırdı. Artık ay sonu raporu beklemek zorunda kalmıyoruz.",
                author: "CEO & Kurucu",
                company: "Y Mobilya Sanayi"
              }
            ].map((testi, index) => (
              <div 
                key={index}
                className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-6"
              >
                <div className="text-[#E24A75] text-4xl font-serif">“</div>
                <p className="text-zinc-300 text-sm leading-relaxed italic mt-[-10px]">{testi.quote}</p>
                <div className="border-t border-white/[0.05] pt-4">
                  <div className="text-white font-bold text-xs">{testi.author}</div>
                  <div className="text-zinc-500 text-[10px]">{testi.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="relative z-10 py-24 max-w-3xl mx-auto px-6 border-t border-white/[0.04]">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-[#E24A75] text-[11px] font-semibold uppercase tracking-wider">
            Yardım
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Sıkça Sorulan Sorular</h2>
          <p className="text-zinc-400 text-sm">
            FOG İstanbul Müşteri Portalı ve ajans iş akışı hakkında en çok merak edilenler.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeFAQ === index;
            return (
              <div 
                key={index} 
                className="border-b border-white/[0.05] pb-4"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveFAQ(isOpen ? null : index);
                  }}
                  className="w-full py-4 flex items-center justify-between text-left group focus:outline-none select-none"
                >
                  <span className="font-semibold text-sm md:text-base text-zinc-100 group-hover:text-white transition-colors">{faq.q}</span>
                  {isOpen ? (
                    <Minus className="w-4 h-4 text-[#E24A75] shrink-0 ml-4" />
                  ) : (
                    <Plus className="w-4 h-4 text-zinc-500 group-hover:text-[#E24A75] shrink-0 ml-4" />
                  )}
                </button>
                
                <div
                  className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-250 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0">
                    <p className="pb-4 pt-1 text-zinc-400 text-xs md:text-sm leading-relaxed pr-8">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CALL TO ACTION (CTA) CARD */}
      <section className="relative z-10 py-16 max-w-7xl mx-auto px-6">
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
              <button
                onClick={handlePortalRedirect}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-black hover:bg-[#E24A75] hover:text-white font-bold transition-all duration-300 shadow-xl active:scale-[0.98] text-[13px]"
              >
                Hemen Başla
              </button>
              
              <button
                onClick={() => {
                  const el = document.getElementById('iletisim');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all duration-300 active:scale-[0.98] text-[13px]"
              >
                Bizimle İletişime Geçin
              </button>
            </div>
          </div>
        </div>
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
