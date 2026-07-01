import type { ElementType } from 'react';
import { BarChart3, Image as ImageIcon, Play } from 'lucide-react';

export interface InstagramDisconnectedCopy {
    icon: ElementType;
    title: string;
    message: string;
    actionLabel: string;
}

export function getInstagramDisconnectedCopy(returnPath: string): InstagramDisconnectedCopy {
    if (returnPath === '/client/instagram/reels') {
        return {
            icon: Play,
            title: 'Reels Verileri Bağlı Değil',
            message: 'Reels performans verilerine erişmek için Instagram hesabınızı bağlayın.',
            actionLabel: "Reels'i Bağla",
        };
    }

    if (returnPath === '/client/instagram/posts') {
        return {
            icon: ImageIcon,
            title: 'Gönderi Verileri Bağlı Değil',
            message: 'Gönderi performans verilerine erişmek için Instagram hesabınızı bağlayın.',
            actionLabel: 'Gönderileri Bağla',
        };
    }

    return {
        icon: BarChart3,
        title: 'Instagram İstatistikleri Bağlı Değil',
        message: 'Takipçi, erişim ve etkileşim verilerine erişmek için Instagram hesabınızı bağlayın.',
        actionLabel: 'İstatistikleri Bağla',
    };
}
