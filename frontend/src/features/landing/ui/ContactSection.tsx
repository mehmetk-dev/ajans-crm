import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';
import api from '../../../api/client';
import { services } from '../model/landingData';
import { ArrowIcon } from './ArrowIcon';

export function ContactSection() {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    message: '',
    website: '',
    consent: false,
  });
  const [contactStatus, setContactStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [contactMessage, setContactMessage] = useState('');
  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contactForm.consent) {
      setContactStatus('error');
      setContactMessage('Devam etmek için aydınlatma metnini onaylayın.');
      return;
    }

    setContactStatus('submitting');
    setContactMessage('');
    try {
      await api.post('/contact', {
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone,
        company: contactForm.company,
        service: contactForm.service,
        message: contactForm.message,
        website: contactForm.website,
      });
      setContactStatus('success');
      setContactMessage('Mesajınız ulaştı. Ekibimiz en kısa sürede sizinle iletişime geçecek.');
      setContactForm({ name: '', email: '', phone: '', company: '', service: '', message: '', website: '', consent: false });
    } catch {
      setContactStatus('error');
      setContactMessage('Mesaj şu anda gönderilemedi. Lütfen biraz sonra tekrar deneyin veya info@fogistanbul.com adresine yazın.');
    }
  };

  return (
    <section id="iletisim" className="relative z-10 border-t border-white/[0.05] px-6 py-24">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.015] shadow-[0_30px_100px_rgba(0,0,0,.35)] lg:grid-cols-[0.8fr_1.2fr]">
        <div className="relative overflow-hidden border-b border-white/10 p-8 md:p-12 lg:border-b-0 lg:border-r">
          <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#e84978]/15 blur-[100px]" />
          <div className="relative">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff8baa]">Birlikte çalışalım</span>
            <h2 className="mt-5 text-4xl font-black leading-[0.95] tracking-[-0.04em] md:text-5xl">
              Projenizi{' '}<br />
              <span className="bg-gradient-to-r from-pink-400 to-amber-400 bg-clip-text text-transparent">bize anlatın.</span>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-zinc-400">
              Hedefinizi, ihtiyacınızı veya mevcut probleminizi kısaca yazın. Ekibimiz talebinizi inceleyip uygun kapsamla size dönsün.
            </p>
            <div className="mt-10 space-y-4 border-t border-white/10 pt-8 text-sm">
              <a href="mailto:info@fogistanbul.com" className="flex items-center gap-3 text-zinc-300 transition hover:text-white">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#e84978]"><Mail className="h-4 w-4" /></span>
                <span><span className="block text-[10px] uppercase tracking-widest text-zinc-600">E-posta</span>info@fogistanbul.com</span>
              </a>
              <div className="flex items-center gap-3 text-zinc-300">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#e84978]"><MapPin className="h-4 w-4" /></span>
                <span><span className="block text-[10px] uppercase tracking-widest text-zinc-600">Konum</span>İstanbul, Türkiye</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleContactSubmit} className="p-8 md:p-12" noValidate={false}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-xs font-semibold text-zinc-300">
              Ad Soyad <span className="text-[#e84978]">*</span>
              <input
                name="name"
                value={contactForm.name}
                onChange={(event) => setContactForm((current) => ({ ...current, name: event.target.value }))}
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm font-normal text-white outline-none transition placeholder:text-zinc-700 focus:border-[#e84978]/60 focus:ring-2 focus:ring-[#e84978]/10"
                placeholder="Adınız ve soyadınız"
              />
            </label>
            <label className="space-y-2 text-xs font-semibold text-zinc-300">
              E-posta <span className="text-[#e84978]">*</span>
              <input
                type="email"
                name="email"
                value={contactForm.email}
                onChange={(event) => setContactForm((current) => ({ ...current, email: event.target.value }))}
                required
                maxLength={254}
                autoComplete="email"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm font-normal text-white outline-none transition placeholder:text-zinc-700 focus:border-[#e84978]/60 focus:ring-2 focus:ring-[#e84978]/10"
                placeholder="ornek@sirket.com"
              />
            </label>
            <label className="space-y-2 text-xs font-semibold text-zinc-300">
              Telefon
              <input
                type="tel"
                name="phone"
                value={contactForm.phone}
                onChange={(event) => setContactForm((current) => ({ ...current, phone: event.target.value }))}
                maxLength={30}
                autoComplete="tel"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm font-normal text-white outline-none transition placeholder:text-zinc-700 focus:border-[#e84978]/60 focus:ring-2 focus:ring-[#e84978]/10"
                placeholder="+90 5xx xxx xx xx"
              />
            </label>
            <label className="space-y-2 text-xs font-semibold text-zinc-300">
              Marka / Şirket
              <input
                name="company"
                value={contactForm.company}
                onChange={(event) => setContactForm((current) => ({ ...current, company: event.target.value }))}
                maxLength={120}
                autoComplete="organization"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm font-normal text-white outline-none transition placeholder:text-zinc-700 focus:border-[#e84978]/60 focus:ring-2 focus:ring-[#e84978]/10"
                placeholder="Marka veya şirket adı"
              />
            </label>
            <label className="space-y-2 text-xs font-semibold text-zinc-300 sm:col-span-2">
              Hangi konuda görüşmek istiyorsunuz? <span className="text-[#e84978]">*</span>
              <select
                name="service"
                value={contactForm.service}
                onChange={(event) => setContactForm((current) => ({ ...current, service: event.target.value }))}
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#0a0a0d] px-4 py-3.5 text-sm font-normal text-white outline-none transition focus:border-[#e84978]/60 focus:ring-2 focus:ring-[#e84978]/10"
              >
                <option value="" disabled>Bir hizmet seçin</option>
                {services.map((service) => <option key={service.title} value={service.title}>{service.title}</option>)}
                <option value="Diğer">Diğer</option>
              </select>
            </label>
            <label className="space-y-2 text-xs font-semibold text-zinc-300 sm:col-span-2">
              Mesajınız <span className="text-[#e84978]">*</span>
              <textarea
                name="message"
                value={contactForm.message}
                onChange={(event) => setContactForm((current) => ({ ...current, message: event.target.value }))}
                required
                minLength={10}
                maxLength={2000}
                rows={6}
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm font-normal leading-6 text-white outline-none transition placeholder:text-zinc-700 focus:border-[#e84978]/60 focus:ring-2 focus:ring-[#e84978]/10"
                placeholder="Projenizi, hedefinizi veya ihtiyacınızı kısaca anlatın."
              />
            </label>
          </div>

          <label className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
            Website
            <input
              name="website"
              value={contactForm.website}
              onChange={(event) => setContactForm((current) => ({ ...current, website: event.target.value }))}
              tabIndex={-1}
              autoComplete="off"
            />
          </label>

          <label className="mt-5 flex cursor-pointer items-start gap-3 text-xs leading-5 text-zinc-500">
            <input
              type="checkbox"
              checked={contactForm.consent}
              onChange={(event) => setContactForm((current) => ({ ...current, consent: event.target.checked }))}
              required
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black accent-[#e84978]"
            />
            <span>
              İletişim talebimin yanıtlanması için bilgilerimin işlenmesini kabul ediyor, <Link to="/privacy-policy" className="text-zinc-300 underline decoration-white/20 underline-offset-2 hover:text-white">Gizlilik Politikası</Link>'nı okuduğumu onaylıyorum.
            </span>
          </label>

          {contactMessage && (
            <div
              role={contactStatus === 'error' ? 'alert' : 'status'}
              className={`mt-5 rounded-xl border px-4 py-3 text-sm ${contactStatus === 'success' ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-200' : 'border-red-300/25 bg-red-300/10 text-red-200'}`}
            >
              {contactMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={contactStatus === 'submitting'}
            className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#e84978] to-amber-500 px-7 py-4 text-sm font-black text-white shadow-[0_18px_45px_rgba(232,73,120,.22)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(232,73,120,.3)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {contactStatus === 'submitting' ? 'Gönderiliyor…' : 'Talebimi Gönder'}
            {contactStatus !== 'submitting' && <ArrowIcon className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </section>
  );
}

