import { lazy } from 'react';
import { Route } from 'react-router-dom';

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
const NotesPage = lazy(() => import('../../pages/staff/NotesPage'));
const StaffMediaLibraryPage = lazy(() => import('../../pages/staff/StaffMediaLibraryPage'));
const StaffSettingsPage = lazy(() => import('../../pages/staff/StaffSettingsPage'));
const ContentPlansPage = lazy(() => import('../../pages/staff/ContentPlansPage'));
const StaffRequestsPage = lazy(() => import('../../pages/staff/StaffRequestsPage'));

export const staffRoutes = [
    <Route index key="dashboard" element={<KanbanPage />} />,
    <Route path="analytics" key="analytics" element={<StaffAnalyticsPage />} />,
    <Route path="tasks" key="tasks" element={<TasksPage />} />,
    <Route path="kanban" key="kanban" element={<KanbanPage />} />,
    <Route path="messaging" key="messaging" element={<MessagingPage />} />,
    <Route path="notes" key="notes" element={<NotesPage />} />,
    <Route path="companies" key="companies" element={<StaffCompaniesPage />} />,
    <Route path="companies/:id" key="company-detail" element={<StaffCompanyDetailPage />} />,
    <Route path="calendar" key="calendar" element={<StaffCalendarPage />} />,
    <Route path="pr" key="pr" element={<PRProjectsPage />} />,
    <Route path="shoots" key="shoots" element={<ShootsPage />} />,
    <Route path="content-plans" key="content-plans" element={<ContentPlansPage />} />,
    <Route path="requests" key="requests" element={<StaffRequestsPage />} />,
    <Route path="meetings" key="meetings" element={<MeetingsPage />} />,
    <Route path="media" key="media" element={<StaffMediaLibraryPage />} />,
    <Route path="completed" key="completed" element={<CompletedTasksPage />} />,
    <Route path="settings" key="settings" element={<StaffSettingsPage />} />,
];