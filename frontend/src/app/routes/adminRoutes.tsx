import { lazy } from 'react';
import { Route } from 'react-router-dom';

const AdminDashboard = lazy(() => import('../../pages/admin/AdminDashboard'));
const AdminAnalyticsPage = lazy(() => import('../../pages/admin/AdminAnalyticsPage'));
const CompaniesPage = lazy(() => import('../../pages/admin/CompaniesPage'));
const CompanyDetailPage = lazy(() => import('../../pages/admin/CompanyDetailPage'));
const StaffPage = lazy(() => import('../../pages/admin/StaffPage'));
const StaffDetailPage = lazy(() => import('../../pages/admin/StaffDetailPage'));
const UsersPage = lazy(() => import('../../pages/admin/UsersPage'));
const ActivityLogPage = lazy(() => import('../../pages/admin/ActivityLogPage'));
const AdminSettingsPage = lazy(() => import('../../pages/admin/AdminSettingsPage'));
const RoutineManagementPage = lazy(() => import('../../pages/admin/RoutineManagementPage'));
const MessagingPage = lazy(() => import('../../pages/staff/MessagingPage'));
const StaffRequestsPage = lazy(() => import('../../pages/staff/StaffRequestsPage'));

export const adminRoutes = [
    <Route index key="dashboard" element={<AdminDashboard />} />,
    <Route path="analytics" key="analytics" element={<AdminAnalyticsPage />} />,
    <Route path="companies" key="companies" element={<CompaniesPage />} />,
    <Route path="companies/:id" key="company-detail" element={<CompanyDetailPage />} />,
    <Route path="staff" key="staff" element={<StaffPage />} />,
    <Route path="staff/:id" key="staff-detail" element={<StaffDetailPage />} />,
    <Route path="users" key="users" element={<UsersPage />} />,
    <Route path="messaging" key="messaging" element={<MessagingPage />} />,
    <Route path="activity-log" key="activity-log" element={<ActivityLogPage />} />,
    <Route path="routines" key="routines" element={<RoutineManagementPage />} />,
    <Route path="requests" key="requests" element={<StaffRequestsPage />} />,
    <Route path="settings" key="settings" element={<AdminSettingsPage />} />,
];