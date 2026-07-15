import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { ArrowIcon } from './ArrowIcon';

interface LandingHeaderProps {
  isAuthenticated: boolean;
  onPortalClick: () => void;
}

export function LandingHeader({ isAuthenticated, onPortalClick }: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#07050a]/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <a href="#top" className="text-2xl font-semibold tracking-tight" aria-label="FOG İstanbul ana sayfa">
          <span className="text-[#e84978]">FOG</span><span className="font-light">istanbul</span>
        </a>
        
        {/* Desktop Menu */}
        <div className="hidden items-center gap-9 text-sm font-medium text-white/62 md:flex">
          <button onClick={() => scrollTo("nasil-calisir")} className="transition hover:text-white cursor-pointer">Nasıl Çalışır?</button>
          <button onClick={() => scrollTo("ozellikler")} className="transition hover:text-white cursor-pointer">Özellikler</button>
          <button onClick={() => scrollTo("referanslar")} className="transition hover:text-white cursor-pointer">Platformun Katkısı</button>
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
            onClick={onPortalClick}
            className="group inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#07050a] transition hover:bg-[#e84978] hover:text-white cursor-pointer"
          >
            {isAuthenticated ? "Müşteri Portalı" : "Giriş Yap"} <ArrowIcon className="h-4 w-4 transition group-hover:translate-x-1" />
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
              <button onClick={() => { setMobileMenuOpen(false); scrollTo("referanslar"); }} className="text-zinc-400 hover:text-white transition-colors text-left cursor-pointer">Platformun Katkısı</button>
              <button onClick={() => { setMobileMenuOpen(false); scrollTo("sss"); }} className="text-zinc-400 hover:text-white transition-colors text-left cursor-pointer">SSS</button>
              <button onClick={() => { setMobileMenuOpen(false); scrollTo("iletisim"); }} className="text-zinc-400 hover:text-white transition-colors text-left cursor-pointer">İletişim</button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onPortalClick();
                }}
                className="w-full py-3 rounded-xl bg-white text-[#07050a] hover:bg-[#e84978] hover:text-white font-semibold text-center transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAuthenticated ? "Müşteri Portalı" : "Giriş Yap"}
                <ArrowIcon className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

