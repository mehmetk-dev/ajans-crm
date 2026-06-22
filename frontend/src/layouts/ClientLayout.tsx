import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useUnreadCount } from '../hooks/useUnreadCount';
import { useClientDashboard } from '../features/client-dashboard';
import { useActiveServices } from '../hooks/useActiveServices';
import { clientApi } from '../api/clientPanel';
import NotificationBell from '../components/NotificationBell';
import GlobalSearch from '../components/GlobalSearch';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSwitcher from '../components/LanguageSwitcher';
import FogLogo from '../components/brand/FogLogo';
import { UserAvatar } from '../components/UserAvatar';
import {
    BarChart3, Image, ListTodo, ShoppingBag,
    Settings, MessageSquare, LogOut, Star, Menu, X, TrendingUp, Sparkles, Search, Users, Camera, FileText, LayoutTemplate,
    Loader2, Globe, Megaphone, Instagram, ChevronDown, BriefcaseBusiness, MessagesSquare, type LucideIcon
} from 'lucide-react';

type ClientNavItem = {
    to: string;
    icon: LucideIcon;
    label: string;
    end?: boolean;
    requiredService?: string;
    ownerOnly?: boolean;
};

type ClientNavGroup = {
    id: string;
    label: string;
    icon: LucideIcon;
    items: ClientNavItem[];
};

const NAV_GROUPS: ClientNavGroup[] = [
    {
        id: 'overview',
        label: 'Genel Bakış',
        icon: BarChart3,
        items: [
            { to: '/client', icon: BarChart3, label: 'Raporlar', end: true },
            { to: '/client/analytics', icon: TrendingUp, label: 'Analitik' },
        ],
    },
    {
        id: 'digital-reports',
        label: 'Dijital Raporlar',
        icon: TrendingUp,
        items: [
            { to: '/client/google-analytics', icon: Globe, label: 'Google Analytics', requiredService: 'DIGITAL_MARKETING' },
            { to: '/client/search-console', icon: Search, label: 'Search Console', requiredService: 'DIGITAL_MARKETING' },
            { to: '/client/web-design', icon: LayoutTemplate, label: 'Web Tasarım', requiredService: 'WEB_DESIGN' },
            { to: '/client/google-ads', icon: Megaphone, label: 'Google Ads', requiredService: 'AD_MANAGEMENT' },
            { to: '/client/meta-ads', icon: Megaphone, label: 'Meta Ads', requiredService: 'AD_MANAGEMENT' },
            { to: '/client/instagram', icon: Instagram, label: 'Instagram', requiredService: 'SOCIAL_MEDIA' },
        ],
    },
    {
        id: 'work-content',
        label: 'İşler & İçerikler',
        icon: BriefcaseBusiness,
        items: [
            { to: '/client/shoots', icon: Camera, label: 'Çekim Takvimi', requiredService: 'PRODUCTION' },
            { to: '/client/content-plans', icon: FileText, label: 'İçerik Planı', requiredService: 'CONTENT_MARKETING' },
            { to: '/client/media', icon: Image, label: 'Medya Kütüphanesi' },
            { to: '/client/tasks', icon: ListTodo, label: 'Görevler' },
        ],
    },
    {
        id: 'communication',
        label: 'İletişim & Ekip',
        icon: MessagesSquare,
        items: [
            { to: '/client/messaging', icon: MessageSquare, label: 'Mesajlar' },
            { to: '/client/team', icon: Users, label: 'Ekibimiz', ownerOnly: true },
            { to: '/client/surveys', icon: Star, label: 'Memnuniyet Anketi', ownerOnly: true },
        ],
    },
    {
        id: 'account-services',
        label: 'Hesap & Hizmetler',
        icon: Settings,
        items: [
            { to: '/client/services', icon: ShoppingBag, label: 'Ek Hizmet Al', ownerOnly: true },
            { to: '/client/onboarding', icon: Sparkles, label: 'Başlangıç Rehberi', ownerOnly: true },
            { to: '/client/settings', icon: Settings, label: 'Ayarlar' },
        ],
    },
];

function isActiveNavItem(item: ClientNavItem, pathname: string) {
    if (item.end) {
        return pathname === item.to;
    }
    return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

export default function ClientLayout() {
    const { user, logout } = useAuth();
    const { pathname } = useLocation();
    const msgCount = useUnreadCount(clientApi.getMyConversations);
    const { isLoading, isAllSettled } = useClientDashboard();
    const { hasService, isLoading: servicesLoading } = useActiveServices();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [splashDone, setSplashDone] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
    const splashMinElapsed = useRef(false);
    const isOwner = user?.membershipRole === 'OWNER';

    const canShowItem = (item: ClientNavItem) => {
        if (item.ownerOnly && !isOwner) return false;
        if (item.requiredService && !servicesLoading && !hasService(item.requiredService)) return false;
        return true;
    };

    const filteredNavGroups = NAV_GROUPS
        .map(group => ({
            ...group,
            items: group.items.filter(canShowItem),
        }))
        .filter(group => group.items.length > 0);

    const toggleGroup = (group: ClientNavGroup, isGroupActive: boolean) => {
        setExpandedGroups(current => ({
            ...current,
            [group.id]: !(current[group.id] ?? isGroupActive),
        }));
    };

    // Minimum 1.6s splash so animation plays + data finishes
    useEffect(() => {
        const t = setTimeout(() => { splashMinElapsed.current = true; }, 1600);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (!isLoading && isAllSettled && splashMinElapsed.current) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSplashDone(true);
        }
        if (!isLoading && isAllSettled) {
            const t = setTimeout(() => setSplashDone(true), 400);
            return () => clearTimeout(t);
        }
    }, [isLoading, isAllSettled]);

    // ─── Splash Screen ─────────────────────────────────────────────
    if (!splashDone) {
        return (
            <div className="fixed inset-0 z-[9999] bg-[#07070A] flex items-center justify-center">
                <div className="flex flex-col items-center gap-8">
                    {/* Glow */}
                    <div className="absolute w-[500px] h-[500px] rounded-full opacity-30"
                         style={{ background: 'radial-gradient(circle, rgba(209,24,28,0.25) 0%, transparent 70%)' }} />
                    {/* Logo */}
                    <div className="relative z-10 flex flex-col items-center gap-6 animate-fade-in">
                        <div className="text-5xl font-bold tracking-tight">
                            <span style={{ color: '#C8697A', fontWeight: 800 }}>FOG</span>
                            <span className="font-light text-white/80" style={{ marginLeft: '0.08em' }}>istanbul</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C8697A] animate-pulse" />
                            <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.2em]">Müşteri Portalı</p>
                        </div>
                    </div>
                    {/* Progress */}
                    <div className="relative z-10 flex flex-col items-center gap-3 mt-2">
                        <div className="w-48 h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
                            <div className="h-full rounded-full animate-splash-bar"
                                 style={{ background: 'linear-gradient(90deg, #D1181C, #C8697A)' }} />
                        </div>
                        <div className="flex items-center gap-2 text-zinc-600">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span className="text-[11px] font-medium">Veriler yükleniyor...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fog-client-shell flex min-h-dvh">
            {/* Mobile Top Bar */}
            <div className="fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3 bg-[#0A0A0C]/90 backdrop-blur-xl border-b border-white/[0.06] md:hidden">
                <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-300">
                    <Menu className="w-5 h-5" />
                </button>
                <FogLogo className="text-[15px]" tone="pink" />
            </div>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-[272px] flex flex-col
                bg-[#0A0A0C]/95 backdrop-blur-2xl border-r border-white/[0.06]
                transform transition-transform duration-200 ease-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:sticky md:top-0 md:h-dvh md:translate-x-0 md:z-auto
            `}
                style={{
                    backgroundImage: 'radial-gradient(600px 300px at 50% 0%, rgba(209, 24, 28, 0.08), transparent 60%)',
                }}
            >
                {/* Brand */}
                <div className="px-6 pt-6 pb-5 flex items-center justify-between relative">
                    <div className="flex flex-col gap-1">
                        <FogLogo className="text-[19px] leading-none" tone="pink" />
                        <div className="flex items-center gap-1.5">
                            <span className="fog-accent-dot inline-block w-1 h-1 rounded-full" />
                            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-[0.18em]">Müşteri Portalı</p>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-white/[0.06] text-zinc-500 md:hidden">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="fog-divider mx-6" />

                {/* Navigation */}
                <nav className="flex-1 px-4 py-5 space-y-2 overflow-y-auto">
                    <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-[0.18em] px-3 mb-3">Menü</p>
                    {filteredNavGroups.map(group => {
                        const isGroupActive = group.items.some(item => isActiveNavItem(item, pathname));
                        const isOpen = isGroupActive || expandedGroups[group.id] === true;
                        const GroupIcon = group.icon;

                        return (
                            <div key={group.id} className="space-y-1">
                                <button
                                    type="button"
                                    onClick={() => toggleGroup(group, isGroupActive)}
                                    aria-expanded={isOpen}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all ${isGroupActive
                                        ? 'text-[#F5BEC8] bg-[#D1181C]/8'
                                        : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03]'
                                    }`}
                                >
                                    <GroupIcon className="w-4 h-4" />
                                    <span className="flex-1 text-left">{group.label}</span>
                                    {group.id === 'communication' && msgCount > 0 && (
                                        <span className="min-w-[18px] h-[16px] flex items-center justify-center text-white text-[9px] font-bold rounded-full px-1.5"
                                            style={{ background: 'linear-gradient(135deg, #D1181C, #C8697A)', boxShadow: '0 4px 10px -2px rgba(209,24,28,0.5)' }}>
                                            {msgCount > 99 ? '99+' : msgCount}
                                        </span>
                                    )}
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isOpen && (
                                    <div className="space-y-0.5 pl-2">
                                        {group.items.map(({ to, icon: Icon, label, end }) => (
                                            <NavLink
                                                key={to}
                                                to={to}
                                                end={end}
                                                onClick={() => setSidebarOpen(false)}
                                                className={({ isActive }) =>
                                                    `fog-nav-item ${isActive ? 'active' : ''} flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium ${isActive
                                                        ? ''
                                                        : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03]'
                                                    }`
                                                }
                                            >
                                                <Icon className="w-[18px] h-[18px]" />
                                                <span className="flex-1">{label}</span>
                                                {label === 'Mesajlar' && msgCount > 0 && (
                                                    <span className="min-w-[20px] h-[18px] flex items-center justify-center text-white text-[10px] font-bold rounded-full px-1.5"
                                                        style={{ background: 'linear-gradient(135deg, #D1181C, #C8697A)', boxShadow: '0 4px 10px -2px rgba(209,24,28,0.5)' }}>
                                                        {msgCount > 99 ? '99+' : msgCount}
                                                    </span>
                                                )}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                <div className="fog-divider mx-6" />

                {/* User info */}
                <div className="px-4 py-4 space-y-1">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <UserAvatar
                            name={user?.fullName}
                            avatarUrl={user?.avatarUrl}
                            className="h-9 w-9 rounded-xl"
                            fallbackClassName="bg-gradient-to-br from-[#D1181C] to-[#C8697A] text-white text-[13px] shadow-lg shadow-[#D1181C]/40"
                            imageClassName="shadow-lg"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] text-white font-semibold truncate">{user?.fullName}</p>
                            <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-zinc-500 hover:text-[#F5BEC8] hover:bg-[#D1181C]/8 w-full transition-all"
                    >
                        <LogOut className="w-[18px] h-[18px]" />
                        <span>Çıkış Yap</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto pt-14 md:pt-0 relative z-10">
                {/* Desktop Header Bar */}
                <div className="hidden md:flex items-center justify-end gap-2 px-8 py-3.5 border-b border-white/[0.05] bg-[#0A0A0C]/40 backdrop-blur-xl sticky top-0 z-20">
                    <button
                        onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                        className="flex items-center gap-2 px-3.5 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[11px] text-zinc-500 hover:text-[#F5BEC8] hover:border-[#C8697A]/25 transition-all"
                    >
                        <Search className="w-3.5 h-3.5" />
                        Ara...
                        <kbd className="bg-white/[0.04] border border-white/[0.06] rounded px-1 py-0.5 font-mono text-[9px]">Ctrl+K</kbd>
                    </button>
                    <ThemeToggle />
                    <LanguageSwitcher />
                    <NotificationBell accentColor="pink" />
                </div>
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
            <GlobalSearch />
        </div>
    );
}
