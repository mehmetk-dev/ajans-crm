import {
    BarChart3,
    Camera,
    FileText,
    Globe,
    Instagram,
    LayoutTemplate,
    Megaphone,
    Search,
    type LucideIcon,
} from 'lucide-react';

export const SERVICE_CATEGORIES = {
    DIGITAL_MARKETING: 'DIGITAL_MARKETING',
    WEB_DESIGN: 'WEB_DESIGN',
    AD_MANAGEMENT: 'AD_MANAGEMENT',
    SOCIAL_MEDIA: 'SOCIAL_MEDIA',
    PRODUCTION: 'PRODUCTION',
    CONTENT_MARKETING: 'CONTENT_MARKETING',
} as const;

export type ServiceCategory = keyof typeof SERVICE_CATEGORIES;

export interface ServiceCatalogItem {
    category: ServiceCategory;
    label: string;
    description: string;
    shortDescription: string;
    icon: LucideIcon;
    color: string;
    glowColor: string;
    panels: string[];
}

export const SERVICE_CATALOG: Record<ServiceCategory, ServiceCatalogItem> = {
    DIGITAL_MARKETING: {
        category: 'DIGITAL_MARKETING',
        label: 'Dijital Pazarlama',
        description: 'Google Analytics ve Search Console verileriyle sitenizin dijital performansini takip edin.',
        shortDescription: 'Google Analytics + Search Console',
        icon: BarChart3,
        color: 'from-blue-500/20 to-violet-500/20 border-blue-500/30',
        glowColor: 'rgba(99,102,241,0.3)',
        panels: ['Google Analytics', 'Search Console'],
    },
    WEB_DESIGN: {
        category: 'WEB_DESIGN',
        label: 'Web Tasarimi',
        description: 'PageSpeed skorlari ve site altyapi verileriyle web sitenizi optimize edin.',
        shortDescription: 'PageSpeed + Site Verileri',
        icon: LayoutTemplate,
        color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
        glowColor: 'rgba(6,182,212,0.3)',
        panels: ['PageSpeed Analizi', 'Site Altyapi Verileri'],
    },
    AD_MANAGEMENT: {
        category: 'AD_MANAGEMENT',
        label: 'Reklam Yonetimi',
        description: 'Google Ads ve Meta Ads kampanyalarinizin performansini tek panelde gorun.',
        shortDescription: 'Google Ads + Meta Ads',
        icon: Megaphone,
        color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
        glowColor: 'rgba(245,158,11,0.3)',
        panels: ['Google Ads', 'Meta Ads'],
    },
    SOCIAL_MEDIA: {
        category: 'SOCIAL_MEDIA',
        label: 'Sosyal Medya',
        description: 'Instagram hesabiniza ait analizleri, Reels ve gonderi performansini takip edin.',
        shortDescription: 'Instagram Analiz + Reels',
        icon: Instagram,
        color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
        glowColor: 'rgba(236,72,153,0.3)',
        panels: ['Instagram Analiz', 'Reels & Gonderiler'],
    },
    PRODUCTION: {
        category: 'PRODUCTION',
        label: 'Produksiyon',
        description: 'Cekim takvimini ve planlanan produksiyon sureclerini takip edin.',
        shortDescription: 'Cekim Takvimi',
        icon: Camera,
        color: 'from-violet-500/20 to-purple-500/20 border-violet-500/30',
        glowColor: 'rgba(139,92,246,0.3)',
        panels: ['Cekim Takvimi'],
    },
    CONTENT_MARKETING: {
        category: 'CONTENT_MARKETING',
        label: 'Icerik Pazarlama',
        description: 'Icerik planlarinizi gorun, onaylayin ve yayin surecini takip edin.',
        shortDescription: 'Icerik Plani',
        icon: FileText,
        color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
        glowColor: 'rgba(16,185,129,0.3)',
        panels: ['Icerik Plani'],
    },
};

export interface ClientServiceNavItem {
    to: string;
    icon: LucideIcon;
    label: string;
    requiredService: ServiceCategory;
}

export const CLIENT_SERVICE_NAV_ITEMS: ClientServiceNavItem[] = [
    { to: '/client/google-analytics', icon: Globe, label: 'Google Analytics', requiredService: 'DIGITAL_MARKETING' },
    { to: '/client/search-console', icon: Search, label: 'Search Console', requiredService: 'DIGITAL_MARKETING' },
    { to: '/client/web-design', icon: LayoutTemplate, label: 'Web Tasarimi', requiredService: 'WEB_DESIGN' },
    { to: '/client/google-ads', icon: Megaphone, label: 'Google Ads', requiredService: 'AD_MANAGEMENT' },
    { to: '/client/meta-ads', icon: Megaphone, label: 'Meta Ads', requiredService: 'AD_MANAGEMENT' },
    { to: '/client/instagram', icon: Instagram, label: 'Instagram', requiredService: 'SOCIAL_MEDIA' },
    { to: '/client/shoots', icon: Camera, label: 'Cekim Takvimi', requiredService: 'PRODUCTION' },
    { to: '/client/content-plans', icon: FileText, label: 'Icerik Plani', requiredService: 'CONTENT_MARKETING' },
];

export const getServiceInfo = (service: string) =>
    SERVICE_CATALOG[service as ServiceCategory];
