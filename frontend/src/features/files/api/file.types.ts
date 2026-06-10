export interface FileAttachmentResponse {
    id: string;
    originalName: string;
    contentType: string | null;
    fileSize: number;
    uploadedById: string;
    uploadedByName: string;
    entityType: string;
    entityId: string;
    createdAt: string;
}

export interface PageResponse<T> {
    content: T[];
    page?: {
        totalElements: number;
        totalPages: number;
        number: number;
        size: number;
    };
    totalElements?: number;
    totalPages?: number;
    number?: number;
    size?: number;
}

export type FileEntityType = 'MESSAGE' | 'TASK' | 'NOTE' | 'COMPANY';

export type FileFilterKey = '' | 'image/' | 'video/' | 'application/';
