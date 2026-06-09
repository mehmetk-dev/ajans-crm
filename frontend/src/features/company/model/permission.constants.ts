import type { PermissionLevel } from '../api/company.types';

export const PERMISSION_LABELS: Record<string, string> = {
    'messages.general.write': 'Genel Kanalda Mesaj Yazma',
    'messages.dm.start': 'Özel Mesaj Başlatma',
    'messages.dm.write': 'Özel Mesajda Yazma',
    'tasks.view': 'Görevleri Görme',
    'tasks.create': 'Görev Oluşturma',
    'tasks.update': 'Görev Güncelleme',
    'calendar.view': 'Takvimi Görme',
    'calendar.create': 'Etkinlik Oluşturma',
    'meetings.request': 'Toplantı Talebi',
    'reports.view': 'Raporları Görme',
    'pr.view': 'PR Projelerini Görme',
    'pr.create': 'PR Projesi Oluşturma',
    'shoots.view': 'Çekimleri Görme',
    'shoots.create': 'Çekim Planlama',
    'panel.dashboard': 'Dashboard Erişimi',
    'panel.companies': 'Şirketler Erişimi',
    'panel.completed_tasks': 'Tamamlanan İşler',
};

export const PERMISSION_LEVEL_STYLES: Record<PermissionLevel, string> = {
    FULL: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    RESTRICTED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    NONE: 'bg-zinc-700/30 text-zinc-500 border-zinc-600/30',
};

const LEVELS: PermissionLevel[] = ['NONE', 'RESTRICTED', 'FULL'];

export function nextPermissionLevel(current: PermissionLevel): PermissionLevel {
    return LEVELS[(LEVELS.indexOf(current) + 1) % LEVELS.length] ?? 'NONE';
}
