import api from '../../../api/client';
import type { FileAttachmentResponse, PageResponse } from './file.types';

export const fileApi = {
    upload: (file: File, entityType: string, entityId: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('entityType', entityType);
        formData.append('entityId', entityId);
        return api.post<FileAttachmentResponse>('/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then(r => r.data);
    },

    getByEntity: (entityType: string, entityId: string) =>
        api.get<FileAttachmentResponse[]>(`/files/entity/${entityType}/${entityId}`)
            .then(r => r.data),

    getDownloadUrl: (fileId: string) => `/api/files/download/${fileId}`,

    delete: (fileId: string) =>
        api.delete(`/files/${fileId}`),

    getCompanyMedia: (companyId: string, page = 0, size = 24, filter?: string) =>
        api.get<PageResponse<FileAttachmentResponse>>(
            `/files/media/company/${companyId}`,
            { params: { page, size, ...(filter ? { filter } : {}) } },
        ).then(r => r.data),

    getCompanyMediaCounts: () =>
        api.get<Record<string, number>>('/files/media/company-counts').then(r => r.data),
};
