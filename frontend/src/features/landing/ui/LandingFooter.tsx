import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="relative z-10 bg-[#050507] border-t border-white/[0.05] pt-20 pb-10">
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
            <li><a href="#ozellikler" className="hover:text-white transition-colors">Hizmetler</a></li>
            <li><a href="#referanslar" className="hover:text-white transition-colors">Platformun Katkısı</a></li>
            <li><a href="#sss" className="hover:text-white transition-colors">SSS</a></li>
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
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#E24A75] shrink-0 mt-0.5" />
              <span>İstanbul, Türkiye</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-white/[0.03] pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-zinc-700">
        <div>GDPR & KVKK Uyumlu Altyapı</div>
        <div>Design inspired by FOG Istanbul Visual System</div>
      </div>
    </footer>
  );
}

