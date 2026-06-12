export interface PageSpeedScore {
    strategy: 'mobile' | 'desktop';
    testedUrl?: string;
    performance?: number | null;
    accessibility?: number | null;
    bestPractices?: number | null;
    seo?: number | null;
    lcpMs?: number | null;
    fidMs?: number | null;
    clsValue?: number | null;
    tbtMs?: number | null;
    fcpMs?: number | null;
    fetchedAt?: string;
    fetchError?: string | null;
}

export interface PageSpeedReport {
    websiteUrl?: string;
    configured: boolean;
    mobile?: PageSpeedScore;
    desktop?: PageSpeedScore;
    hostingProvider?: string | null;
    domainExpiry?: string | null;
    sslExpiry?: string | null;
    cmsType?: string | null;
    cmsVersion?: string | null;
    themeName?: string | null;
    analyticsConnected?: boolean;
    searchConsoleConnected?: boolean;
    gaPropertyId?: string | null;
    searchConsoleSiteUrl?: string | null;
}

export type Strategy = 'mobile' | 'desktop';
export type HealthTone = 'good' | 'warning' | 'bad' | 'unknown';

export type ToneStyle = {
    label: string;
    text: string;
    border: string;
    bg: string;
    iconBg: string;
    softBg: string;
};

export const toneStyles: Record<HealthTone, ToneStyle> = {
    good: {
        label: 'Sağlıklı',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20',
        bg: 'bg-emerald-500/10',
        iconBg: 'bg-emerald-500/15',
        softBg: 'bg-emerald-500/5',
    },
    warning: {
        label: 'Dikkat',
        text: 'text-amber-400',
        border: 'border-amber-500/20',
        bg: 'bg-amber-500/10',
        iconBg: 'bg-amber-500/15',
        softBg: 'bg-amber-500/5',
    },
    bad: {
        label: 'Kritik',
        text: 'text-red-400',
        border: 'border-red-500/20',
        bg: 'bg-red-500/10',
        iconBg: 'bg-red-500/15',
        softBg: 'bg-red-500/5',
    },
    unknown: {
        label: 'Bekliyor',
        text: 'text-zinc-500',
        border: 'border-white/[0.08]',
        bg: 'bg-white/[0.04]',
        iconBg: 'bg-white/[0.05]',
        softBg: 'bg-white/[0.02]',
    },
};
