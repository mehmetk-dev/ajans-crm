import {
    CheckCircle2, Clock, FileText, Globe, Instagram, Linkedin,
    Monitor, RotateCcw, Smartphone, Sparkles, Twitter, Youtube,
} from 'lucide-react';
import type { ContentPlatform, ContentStatus } from '../api/contentPlan.types';

export const platformPresentation = {
    INSTAGRAM: { label: 'Instagram', icon: Instagram, className: 'bg-pink-500/10 text-pink-400' },
    TIKTOK: { label: 'TikTok', icon: Smartphone, className: 'bg-cyan-500/10 text-cyan-400' },
    YOUTUBE: { label: 'YouTube', icon: Youtube, className: 'bg-red-500/10 text-red-400' },
    FACEBOOK: { label: 'Facebook', icon: Globe, className: 'bg-blue-500/10 text-blue-400' },
    LINKEDIN: { label: 'LinkedIn', icon: Linkedin, className: 'bg-sky-500/10 text-sky-400' },
    TWITTER: { label: 'Twitter', icon: Twitter, className: 'bg-zinc-500/10 text-zinc-300' },
    WEBSITE: { label: 'Web Sitesi', icon: Monitor, className: 'bg-emerald-500/10 text-emerald-400' },
    WEB: { label: 'Web', icon: Monitor, className: 'bg-emerald-500/10 text-emerald-400' },
    OTHER: { label: 'Diğer', icon: Globe, className: 'bg-zinc-500/10 text-zinc-400' },
} satisfies Record<ContentPlatform, {
    label: string;
    icon: typeof FileText;
    className: string;
}>;

export const statusPresentation = {
    DRAFT: { label: 'Taslak', icon: FileText, className: 'bg-zinc-500/10 text-zinc-400' },
    WAITING_APPROVAL: { label: 'Onay Bekliyor', icon: Clock, className: 'bg-amber-500/10 text-amber-400' },
    REVISION: { label: 'Revize', icon: RotateCcw, className: 'bg-orange-500/10 text-orange-400' },
    APPROVED: { label: 'Onaylandı', icon: CheckCircle2, className: 'bg-emerald-500/10 text-emerald-400' },
    PUBLISHED: { label: 'Yayınlandı', icon: Sparkles, className: 'bg-pink-500/10 text-pink-400' },
} satisfies Record<ContentStatus, {
    label: string;
    icon: typeof FileText;
    className: string;
}>;
