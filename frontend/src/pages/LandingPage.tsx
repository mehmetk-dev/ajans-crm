import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import {
  AboutSection,
  ApprovalSection,
  BenefitsSection,
  ContactSection,
  CtaSection,
  FaqSection,
  HeroSection,
  LandingFooter,
  LandingHeader,
  ServicesSection,
  WorkflowSection,
} from '../features/landing/ui';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePortalRedirect = () => {
    navigate('/dashboard');
  };

  return (
    <div className="relative min-h-screen bg-[#08080A] text-white overflow-hidden font-sans select-none">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-[20%] w-[800px] h-[800px] bg-pink-500/5 rounded-full blur-[140px]" />
        <div className="absolute top-[30%] right-[10%] w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[800px] h-[800px] bg-pink-500/5 rounded-full blur-[150px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 90%)',
          }}
        />
      </div>

      <LandingHeader isAuthenticated={Boolean(user)} onPortalClick={handlePortalRedirect} />
      <HeroSection onPortalClick={handlePortalRedirect} />
      <AboutSection />
      <WorkflowSection />
      <ServicesSection />
      <ApprovalSection />
      <BenefitsSection />
      <FaqSection />
      <CtaSection onPortalClick={handlePortalRedirect} />
      <ContactSection />
      <LandingFooter />
    </div>
  );
}
