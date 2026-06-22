export type PrProjectStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED';

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export interface PrPhaseNote {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatarUrl?: string | null;
    content: string;
    createdAt: string;
}

export interface PrProjectPhase {
    id: string;
    phaseNumber: number;
    name: string;
    isCompleted: boolean;
    completedAt: string | null;
    assignedToId: string | null;
    assignedToName: string | null;
    assignedToAvatarUrl?: string | null;
    taskId: string | null;
    startDate: string | null;
    endDate: string | null;
    notes: string | null;
    status: string;
    phaseNotes: PrPhaseNote[];
}

export interface PrProjectResponse {
    id: string;
    companyId: string | null;
    companyName: string | null;
    name: string;
    purpose: string | null;
    totalPhases: number;
    currentPhase: number;
    progressPercent: number;
    status: PrProjectStatus;
    createdById: string;
    createdByName: string;
    createdByAvatarUrl?: string | null;
    responsibleId: string | null;
    responsibleName: string | null;
    responsibleAvatarUrl?: string | null;
    startDate: string | null;
    endDate: string | null;
    notes: string | null;
    phases: PrProjectPhase[];
    members: { userId: string; fullName: string; avatarUrl?: string | null }[];
    createdAt: string;
}

export interface PrProjectPhaseInput {
    name: string;
    assignedToId?: string;
    startDate?: string;
    endDate?: string;
    notes?: string;
}

export interface CreatePrProjectInput {
    name: string;
    companyId?: string;
    responsibleId?: string;
    purpose?: string;
    startDate?: string;
    endDate?: string;
    notes?: string;
    totalPhases?: number;
    phases?: PrProjectPhaseInput[];
    memberIds?: string[];
}

export interface UpdatePrProjectInput {
    name?: string;
    purpose?: string;
    companyId?: string;
    responsibleId?: string;
    startDate?: string;
    endDate?: string;
    notes?: string;
    status?: PrProjectStatus;
    phases?: (Partial<PrProjectPhaseInput> & { id?: string })[];
}
