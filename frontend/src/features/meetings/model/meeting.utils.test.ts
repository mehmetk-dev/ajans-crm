import { describe, expect, it } from 'vitest';
import type { MeetingResponse } from '../api/meeting.types';
import {
    hasMeetingNote,
    isMeetingParticipant,
    needsMeetingNote,
    toCreateMeetingInput,
} from './meeting.utils';

describe('meeting utils', () => {
    it('maps form values to the API input', () => {
        const input = toCreateMeetingInput({
            companyId: '',
            title: '  Planlama  ',
            description: '  Haftalık plan  ',
            meetingDate: '2026-06-09T15:30',
            durationMinutes: 60,
            location: '  Ofis  ',
            participantIds: ['user-1'],
        });

        expect(input).toMatchObject({
            companyId: undefined,
            title: 'Planlama',
            description: 'Haftalık plan',
            durationMinutes: 60,
            location: 'Ofis',
            participantIds: ['user-1'],
        });
        expect(input.meetingDate).toBe(new Date('2026-06-09T15:30').toISOString());
    });

    it('treats the creator as a participant for note flow', () => {
        const meeting = buildMeeting({ createdById: 'creator' });

        expect(isMeetingParticipant(meeting, 'creator')).toBe(true);
        expect(needsMeetingNote(meeting, 'creator')).toBe(true);
    });

    it('does not request another note after submission', () => {
        const meeting = buildMeeting({
            participants: [{ userId: 'user-1', fullName: 'User', email: 'user@example.com', noteSubmitted: true }],
            notes: [{ userId: 'user-1', fullName: 'User', content: 'Not', createdAt: '2026-06-09T12:00:00Z' }],
        });

        expect(hasMeetingNote(meeting, 'user-1')).toBe(true);
        expect(needsMeetingNote(meeting, 'user-1')).toBe(false);
    });
});

function buildMeeting(overrides: Partial<MeetingResponse> = {}): MeetingResponse {
    return {
        id: 'meeting-1',
        companyId: null,
        companyName: null,
        title: 'Toplantı',
        description: null,
        meetingDate: '2026-06-09T12:00:00Z',
        durationMinutes: 60,
        location: null,
        status: 'COMPLETED',
        createdById: 'creator',
        createdByName: 'Creator',
        participants: [],
        notes: [],
        createdAt: '2026-06-09T11:00:00Z',
        ...overrides,
    };
}
