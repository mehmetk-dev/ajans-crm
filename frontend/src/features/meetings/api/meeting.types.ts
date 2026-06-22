export type MeetingStatus = 'PLANNED' | 'COMPLETED' | 'CANCELLED';

export interface MeetingParticipant {
    userId: string;
    fullName: string;
    avatarUrl?: string | null;
    email: string;
    noteSubmitted: boolean;
}

export interface MeetingNote {
    userId: string;
    fullName: string;
    avatarUrl?: string | null;
    content: string;
    createdAt: string;
}

export interface MeetingResponse {
    id: string;
    companyId: string | null;
    companyName: string | null;
    title: string;
    description: string | null;
    meetingDate: string;
    durationMinutes: number | null;
    location: string | null;
    status: MeetingStatus;
    createdById: string;
    createdByName: string;
    createdByAvatarUrl?: string | null;
    participants: MeetingParticipant[];
    notes: MeetingNote[];
    createdAt: string;
}

export interface CreateMeetingInput {
    companyId?: string;
    title: string;
    description?: string;
    meetingDate: string;
    durationMinutes?: number;
    location?: string;
    participantIds?: string[];
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}
