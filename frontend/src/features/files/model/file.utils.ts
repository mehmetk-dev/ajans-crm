import { Image, Video, FileText, File } from 'lucide-react';
import type { ComponentType } from 'react';

export function getFileIcon(contentType: string | null): ComponentType<{ className?: string }> {
    if (!contentType) return File;
    if (contentType.startsWith('image/')) return Image;
    if (contentType.startsWith('video/')) return Video;
    return FileText;
}

export function isImageType(contentType: string | null): boolean {
    return !!contentType?.startsWith('image/');
}

export function isVideoType(contentType: string | null): boolean {
    return !!contentType?.startsWith('video/');
}

export function isPreviewable(contentType: string | null): boolean {
    return isImageType(contentType) || isVideoType(contentType);
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function formatFileDate(d: string): string {
    try {
        return new Date(d).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return d;
    }
}

export function getPageTotalPages(data: { page?: { totalPages: number }; totalPages?: number } | undefined): number {
    return data?.page?.totalPages ?? data?.totalPages ?? 0;
}
