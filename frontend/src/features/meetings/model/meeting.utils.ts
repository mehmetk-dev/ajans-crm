import type { CreateMeetingInput, MeetingResponse } from '../api/meeting.types';

export interface MeetingFormValues {
    companyId: string;
    title: string;
    description: string;
    meetingDate: string;
    durationMinutes: number;
    location: string;
    participantIds: string[];
}

export const defaultMeetingFormValues: MeetingFormValues = {
    companyId: '',
    title: '',
    description: '',
    meetingDate: '',
    durationMinutes: 60,
    location: '',
    participantIds: [],
};

export function toCreateMeetingInput(values: MeetingFormValues): CreateMeetingInput {
    return {
        companyId: values.companyId || undefined,
        title: values.title.trim(),
        description: values.description.trim() || undefined,
        meetingDate: new Date(values.meetingDate).toISOString(),
        durationMinutes: values.durationMinutes || undefined,
        location: values.location.trim() || undefined,
        participantIds: values.participantIds.length ? values.participantIds : undefined,
    };
}

export function isMeetingParticipant(meeting: MeetingResponse, userId?: string): boolean {
    if (!userId) return false;
    return meeting.createdById === userId
        || meeting.participants.some(participant => participant.userId === userId);
}

export function hasMeetingNote(meeting: MeetingResponse, userId?: string): boolean {
    return Boolean(userId && meeting.notes.some(note => note.userId === userId));
}

export function needsMeetingNote(meeting: MeetingResponse, userId?: string): boolean {
    return meeting.status === 'COMPLETED'
        && isMeetingParticipant(meeting, userId)
        && !hasMeetingNote(meeting, userId);
}
