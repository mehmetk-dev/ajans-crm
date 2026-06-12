import { lazy } from 'react';
import { Route } from 'react-router-dom';

const StaffDashboard = lazy(() => import('../../pages/staff/StaffDashboard'));
const TasksPage = lazy(() => import('../../pages/staff/TasksPage'));
const StaffCompaniesPage = lazy(() => import('../../pages/staff/StaffCompaniesPage'));
const StaffCompanyDetailPage = lazy(() => import('../../pages/staff/StaffCompanyDetailPage'));
const StaffCalendarPage = lazy(() => import('../../pages/staff/StaffCalendarPage'));
const CompletedTasksPage = lazy(() => import('../../pages/staff/CompletedTasksPage'));
const PRProjectsPage = lazy(() => import('../../pages/staff/PRProjectsPage'));
const ShootsPage = lazy(() => import('../../pages/staff/ShootsPage'));
const MeetingsPage = lazy(() => import('../../pages/staff/MeetingsPage'));
const MessagingPage = lazy(() => import('../../pages/staff/MessagingPage'));
const StaffAnalyticsPage = lazy(() => import('../../pages/staff/StaffAnalyticsPage'));
const KanbanPage = lazy(() => import('../../pages/staff/KanbanPage'));
const TimeTrackingPage = lazy(() => import('../../pages/staff/TimeTrackingPage'));
const NotesPage = lazy(() => import('../../pages/staff/NotesPage'));
const StaffMediaLibraryPage = lazy(() => import('../../pages/staff/StaffMediaLibraryPage'));
const StaffSettingsPage = lazy(() => import('../../pages/staff/StaffSettingsPage'));
const ContentPlansPage = lazy(() => import('../../pages/staff/ContentPlansPage'));
const StaffRequestsPage = lazy(() => import('../../pages/staff/StaffRequestsPage'));

export function StaffRoutes() {
    return (
        <>
            <Route index element={<StaffDashboard />} />
            <Route path="analytics" element={<StaffAnalyticsPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="kanban" element={<KanbanPage />} />
            <Route path="time-tracking" element={<TimeTrackingPage />} />
            <Route path="messaging" element={<MessagingPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="companies" element={<StaffCompaniesPage />} />
            <Route path="companies/:id" element={<StaffCompanyDetailPage />} />
            <Route path="calendar" element={<StaffCalendarPage />} />
            <Route path="pr" element={<PRProjectsPage />} />
            <Route path="shoots" element={<ShootsPage />} />
            <Route path="content-plans" element={<ContentPlansPage />} />
            <Route path="requests" element={<StaffRequestsPage />} />
            <Route path="meetings" element={<MeetingsPage />} />
            <Route path="media" element={<StaffMediaLibraryPage />} />
            <Route path="completed" element={<CompletedTasksPage />} />
            <Route path="settings" element={<StaffSettingsPage />} />
        </>
    );
}