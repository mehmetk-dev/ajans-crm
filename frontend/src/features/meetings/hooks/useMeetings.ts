import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { meetingApi } from '../api/meetingApi';
import { meetingKeys } from '../api/meetingKeys';
import type { CreateMeetingInput, MeetingStatus } from '../api/meeting.types';

export function useMeetings(size = 100, companyId?: string) {
    return useQuery({
        queryKey: meetingKeys.staffList(companyId, size),
        queryFn: () => companyId
            ? meetingApi.listByCompany(companyId, 0, size)
            : meetingApi.list(0, size),
    });
}

export function useCreateMeeting() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateMeetingInput) => meetingApi.create(input),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: meetingKeys.staffLists() }),
    });
}

export function useUpdateMeetingStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: MeetingStatus }) =>
            meetingApi.updateStatus(id, status),
        onSuccess: meeting => refreshMeeting(queryClient, meeting.id),
    });
}

export function useCompleteMeeting() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, content }: { id: string; content: string }) =>
            meetingApi.complete(id, content),
        onSuccess: meeting => refreshMeeting(queryClient, meeting.id),
    });
}

export function useAddMeetingNote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, content }: { id: string; content: string }) =>
            meetingApi.addNote(id, content),
        onSuccess: meeting => refreshMeeting(queryClient, meeting.id),
    });
}

export function useDeleteMeeting() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: meetingApi.delete,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: meetingKeys.staffLists() }),
    });
}

function refreshMeeting(
    queryClient: ReturnType<typeof useQueryClient>,
    meetingId: string,
) {
    queryClient.invalidateQueries({ queryKey: meetingKeys.staffLists() });
    queryClient.invalidateQueries({ queryKey: meetingKeys.detail(meetingId) });
}
