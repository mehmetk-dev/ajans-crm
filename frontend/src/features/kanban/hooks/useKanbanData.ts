import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../../../api/settings';
import type { PageResponse } from '../../../api/staff';
import {
    taskApi,
    taskKeys,
    type TaskResponse,
    type TaskStatus,
} from '../../tasks';
import { meetingApi, meetingKeys, type MeetingResponse } from '../../meetings';
import { useStaffShoots } from '../../shoots';
import { usePrProjects } from '../../pr-projects';
import { useAuth } from '../../../store/AuthContext';
import {
    isToday,
    isFuture,
    isOverdue,
    dateToKey,
    toLocalDateKey,
    parseLocalDateKey,
} from '../model/kanban.utils';

export type KanbanStatus = TaskStatus;

export function useKanbanData() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const avatarMutation = useMutation({
        mutationFn: (file: File) => settingsApi.uploadAvatar(file),
        onSuccess: () => {
            window.location.reload();
        },
    });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) avatarMutation.mutate(file);
    };

    const { data: myTasksData, isLoading: loadingTasks } = useQuery<PageResponse<TaskResponse>>({
        queryKey: taskKeys.staffList('mine'),
        queryFn: () => taskApi.listMine(0, 50),
    });

    const { data: shootsData, isLoading: loadingShoots } = useStaffShoots(0, 50);

    const { data: meetingsData } = useQuery<PageResponse<MeetingResponse>>({
        queryKey: meetingKeys.staffList(undefined, 50),
        queryFn: () => meetingApi.list(0, 50),
    });

    const { data: prData } = usePrProjects(0, 50);

    const allTasks = myTasksData?.content ?? [];
    const allShoots = shootsData?.content ?? [];
    const allMeetings = meetingsData?.content ?? [];
    const allPr = prData?.content ?? [];

    const activeTasks = allTasks.filter(t => t.status !== 'DONE');
    const overdueTasks = allTasks.filter(isOverdue);
    const todayTasks = allTasks.filter(t => isToday(t.endDate) && t.status !== 'DONE');
    const completedTasks = allTasks.filter(t => t.status === 'DONE');
    const upcomingShoots = allShoots.filter(s => isFuture(s.shootDate) && s.status !== 'CANCELLED').sort((a, b) => new Date(a.shootDate!).getTime() - new Date(b.shootDate!).getTime());
    const todayShoots = allShoots.filter(s => isToday(s.shootDate) && s.status !== 'CANCELLED');
    const upcomingMeetings = allMeetings.filter(m => isFuture(m.meetingDate) && m.status !== 'CANCELLED').sort((a, b) => new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime());
    const activePr = allPr.filter(p => p.status === 'ACTIVE');

    const completionRate = allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;

    const handleTaskStatusChange = async (taskId: string, status: TaskStatus) => {
        try {
            await taskApi.update(taskId, { status });
            queryClient.invalidateQueries({ queryKey: taskKeys.staffLists() });
            setSelectedTask(null);
        } catch {
            // Keep the selected task open when the status update fails.
        }
    };

    const isLoading = loadingTasks || loadingShoots;

    return {
        user,
        selectedTask,
        setSelectedTask,
        selectedDay,
        setSelectedDay,
        avatarInputRef,
        avatarMutation,
        handleAvatarChange,
        isLoading,
        allTasks,
        allShoots,
        allMeetings,
        activeTasks,
        overdueTasks,
        todayTasks,
        todayShoots,
        upcomingShoots,
        upcomingMeetings,
        activePr,
        completionRate,
        handleTaskStatusChange,
        dateToKey,
        toLocalDateKey,
        parseLocalDateKey,
    };
}