export type ShootStatus = 'PLANNED' | 'COMPLETED' | 'CANCELLED';
export type ShootDisplayStatus = ShootStatus | 'OVERDUE';
export type ShootScope = 'staff' | 'client';

export interface ShootParticipant {
    userId: string;
    fullName: string;
    roleInShoot: string | null;
}

export interface ShootEquipment {
    id: string;
    name: string;
    quantity: number;
    notes: string | null;
}

export interface ShootResponse {
    id: string;
    companyId: string;
    companyName: string;
    title: string;
    description: string | null;
    shootDate: string | null;
    shootTime: string | null;
    location: string | null;
    status: ShootStatus;
    photographerId: string | null;
    photographerName: string | null;
    notes: string | null;
    createdById: string;
    createdByName: string;
    participants: ShootParticipant[];
    equipment: ShootEquipment[];
    linkedContentCount: number;
    createdAt: string;
}

export interface CreateShootInput {
    companyId: string;
    title: string;
    description?: string;
    shootDate?: string;
    shootTime?: string;
    location?: string;
    photographerId?: string;
    notes?: string;
    participants?: { userId: string; roleInShoot?: string }[];
    equipment?: { name: string; quantity?: number; notes?: string }[];
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}
