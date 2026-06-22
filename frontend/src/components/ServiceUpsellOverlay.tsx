import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles } from 'lucide-react';
import { useActiveServices } from '../hooks/useActiveServices';
import { getServiceInfo, type ServiceCategory } from '../features/serviceCatalog';

const fallbackInfo = {
    label: 'Bu Hizmet',
    description: 'Bu içerik için hizmet paketinin aktif olması gerekir.',
    icon: Lock,
    color: 'from-zinc-500/20 to-zinc-600/20 border-zinc-500/30',
    glowColor: 'rgba(113,113,122,0.3)',
    panels: [] as string[],
};

export function ServiceBlurOverlay({ service, compact = false }: { service: ServiceCategory | string; compact?: boolean }) {
    const navigate = useNavigate();
    const info = getServiceInfo(service) ?? fallbackInfo;
    const Icon = info.icon;

    return (
        <div className={`relative ${compact ? 'min-h-[180px]' : 'min-h-[300px]'} flex items-center justify-center overflow-hidden rounded-2xl`}>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden>
                <div
                    className="w-full h-full opacity-10 scale-105"
                    style={{
                        filter: 'blur(8px)',
                        backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 40px)',
                    }}
                />
                {Array.from({ length: compact ? 3 : 6 }).map((_, i) => (
                    <div key={i} className="absolute" style={{ top: `${15 + i * 13}%`, left: '5%', right: '5%' }}>
                        <div className="h-3 rounded-full bg-white/5" style={{ width: `${40 + (i * 17) % 50}%` }} />
                    </div>
                ))}
            </div>

            <div
                className={`relative z-10 flex flex-col items-center text-center p-6 rounded-2xl border bg-gradient-to-br ${info.color} backdrop-blur-sm max-w-xs mx-auto shadow-2xl`}
                style={{ boxShadow: `0 0 60px 0 ${info.glowColor}` }}
            >
                <div className="w-12 h-12 rounded-2xl bg-white/[0.08] border border-white/[0.1] flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-white/60" />
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] mb-3">
                    <Lock className="w-3 h-3 text-zinc-400" />
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Hizmet Aktif Değil</span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1">{info.label}</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed mb-4">{info.description}</p>

                {info.panels.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                        {info.panels.map((panel) => (
                            <span key={panel} className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[10px] text-zinc-400 border border-white/[0.08]">
                                {panel}
                            </span>
                        ))}
                    </div>
                )}

                <button
                    onClick={() => navigate('/client/services')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105 active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #D1181C, #C8697A)', boxShadow: '0 8px 20px -6px rgba(209,24,28,0.5)' }}
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    Hizmeti Aktif Et
                </button>
            </div>
        </div>
    );
}

export function ServicePageGate({ service, children }: { service: ServiceCategory | string; children: ReactNode }) {
    const navigate = useNavigate();
    const { hasService, isLoading } = useActiveServices();

    if (isLoading || hasService(service)) {
        return <>{children}</>;
    }

    const info = getServiceInfo(service) ?? fallbackInfo;
    const Icon = info.icon;

    return (
        <div className="relative">
            <div className="pointer-events-none select-none" style={{ filter: 'blur(12px)', opacity: 0.25 }} aria-hidden>
                {children}
            </div>

            <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#07070A]/60 backdrop-blur-sm rounded-3xl">
                <div
                    className={`flex flex-col items-center text-center p-8 rounded-3xl border bg-gradient-to-br ${info.color} backdrop-blur-xl max-w-sm mx-4 shadow-2xl`}
                    style={{ boxShadow: `0 0 100px 0 ${info.glowColor}` }}
                >
                    <div className="relative mb-5">
                        <div className="w-20 h-20 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                            <Icon className="w-9 h-9 text-white/50" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#D1181C] flex items-center justify-center border-2 border-[#07070A]">
                            <Lock className="w-3 h-3 text-white" />
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.06] mb-3">
                        <Lock className="w-3 h-3 text-zinc-400" />
                        <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Bu hizmet aktif değil</span>
                    </div>

                    <h2 className="text-xl font-bold text-white mb-2">{info.label}</h2>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-6 max-w-xs">{info.description}</p>

                    {info.panels.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center mb-6">
                            {info.panels.map((panel) => (
                                <span key={panel} className="px-3 py-1 rounded-full bg-white/[0.06] text-[11px] text-zinc-400 border border-white/[0.08]">
                                    {panel}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col gap-2 w-full">
                        <button
                            onClick={() => navigate('/client/services')}
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                            style={{ background: 'linear-gradient(135deg, #D1181C, #C8697A)', boxShadow: '0 12px 24px -8px rgba(209,24,28,0.5)' }}
                        >
                            <Sparkles className="w-4 h-4" />
                            Hizmeti Aktif Et
                        </button>
                        <button
                            onClick={() => navigate('/client')}
                            className="text-[12px] text-zinc-600 hover:text-zinc-400 transition-colors py-1"
                        >
                            Ana Sayfaya Dön
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
