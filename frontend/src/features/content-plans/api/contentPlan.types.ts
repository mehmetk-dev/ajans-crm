export type ContentPlanScope = 'staff' | 'client';
export type ContentPlatform =
    | 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE' | 'FACEBOOK'
    | 'LINKEDIN' | 'TWITTER' | 'WEBSITE' | 'WEB' | 'OTHER';
export type ContentStatus = 'DRAFT' | 'WAITING_APPROVAL' | 'REVISION' | 'APPROVED' | 'PUBLISHED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ApprovalType = 'CONTENT_APPROVAL' | 'SHOOT_REQUEST' | 'TASK_REQUEST' | 'MEETING_REQUEST' | 'GENERAL';

export interface ContentPlanResponse {
    id: string;
    companyId: string;
    companyName: string;
    createdById: string;
    createdByName: string;
    title: string;
    description: string | null;
    authorName: string;
    platform: ContentPlatform;
    contentSize: string | null;
    direction: string | null;
    speakerModel: string | null;
    status: ContentStatus;
    revisionNote: string | null;
    plannedDate: string | null;
    shootId: string | null;
    shootDate: string | null;
    shootTitle: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateContentPlanInput {
    companyId: string;
    title: string;
    description?: string;
    authorName: string;
    platform: ContentPlatform;
    contentSize?: string;
    direction?: string;
    speakerModel?: string;
    plannedDate?: string;
}

export type ContentPlanFormValues = Omit<CreateContentPlanInput, 'companyId'>;

export type UpdateContentPlanInput = Partial<Omit<CreateContentPlanInput, 'companyId'>> & {
    status?: ContentStatus;
    revisionNote?: string;
};

export interface ContentApprovalDetails {
    shootTitle?: string;
    shootDescription?: string;
    shootDate?: string;
    shootTime?: string;
    location?: string;
    existingShootId?: string;
}

export interface CreateApprovalInput {
    type: ApprovalType;
    referenceId?: string;
    companyId: string;
    title: string;
    description?: string;
    metadata?: string;
}

export interface ReviewApprovalInput extends ContentApprovalDetails {
    note?: string;
    photographerId?: string;
    notes?: string;
    equipment?: Array<{ name: string; quantity?: number; notes?: string }>;
}

export interface ApprovalRequestResponse {
    id: string;
    type: ApprovalType;
    referenceId: string | null;
    companyName: string;
    companyId: string;
    requestedByName: string;
    requestedById: string;
    status: ApprovalStatus;
    title: string;
    description: string | null;
    metadata: string | null;
    reviewedByName: string | null;
    reviewNote: string | null;
    createdAt: string;
    reviewedAt: string | null;
}
