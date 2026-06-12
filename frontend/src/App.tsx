import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './store/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RouteBoundary, {
  RouteLoadingFallback,
} from './components/routing/RouteBoundary';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const ServicePageGate = lazy(() =>
  import('./components/ServiceUpsellOverlay').then(module => ({
    default: module.ServicePageGate,
  })),
);

const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const CompaniesPage = lazy(() => import('./pages/admin/CompaniesPage'));
const CompanyDetailPage = lazy(() => import('./pages/admin/CompanyDetailPage'));
const StaffPage = lazy(() => import('./pages/admin/StaffPage'));
const StaffDetailPage = lazy(() => import('./pages/admin/StaffDetailPage'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));
const ActivityLogPage = lazy(() => import('./pages/admin/ActivityLogPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));
const RoutineManagementPage = lazy(
  () => import('./pages/admin/RoutineManagementPage'),
);

const StaffLayout = lazy(() => import('./layouts/StaffLayout'));
const StaffDashboard = lazy(() => import('./pages/staff/StaffDashboard'));
const TasksPage = lazy(() => import('./pages/staff/TasksPage'));
const StaffCompaniesPage = lazy(() => import('./pages/staff/StaffCompaniesPage'));
const StaffCompanyDetailPage = lazy(
  () => import('./pages/staff/StaffCompanyDetailPage'),
);
const StaffCalendarPage = lazy(() => import('./pages/staff/StaffCalendarPage'));
const CompletedTasksPage = lazy(() => import('./pages/staff/CompletedTasksPage'));
const PRProjectsPage = lazy(() => import('./pages/staff/PRProjectsPage'));
const ShootsPage = lazy(() => import('./pages/staff/ShootsPage'));
const MeetingsPage = lazy(() => import('./pages/staff/MeetingsPage'));
const MessagingPage = lazy(() => import('./pages/staff/MessagingPage'));
const StaffAnalyticsPage = lazy(() => import('./pages/staff/StaffAnalyticsPage'));
const KanbanPage = lazy(() => import('./pages/staff/KanbanPage'));
const TimeTrackingPage = lazy(() => import('./pages/staff/TimeTrackingPage'));
const NotesPage = lazy(() => import('./pages/staff/NotesPage'));
const StaffMediaLibraryPage = lazy(
  () => import('./pages/staff/StaffMediaLibraryPage'),
);
const StaffSettingsPage = lazy(() => import('./pages/staff/StaffSettingsPage'));
const ContentPlansPage = lazy(() => import('./pages/staff/ContentPlansPage'));
const StaffRequestsPage = lazy(() => import('./pages/staff/StaffRequestsPage'));

const ClientLayout = lazy(() => import('./layouts/ClientLayout'));
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard'));
const MediaLibraryPage = lazy(() => import('./pages/client/MediaLibraryPage'));
const ClientTasksPage = lazy(() => import('./pages/client/ClientTasksPage'));
const ServicesPage = lazy(() => import('./pages/client/ServicesPage'));
const ClientSettingsPage = lazy(() => import('./pages/client/ClientSettingsPage'));
const ClientMessagingPage = lazy(
  () => import('./pages/client/ClientMessagingPage'),
);
const SurveyPage = lazy(() => import('./pages/client/SurveyPage'));
const ClientAnalyticsPage = lazy(
  () => import('./pages/client/ClientAnalyticsPage'),
);
const GoogleAnalyticsDetailPage = lazy(
  () => import('./pages/client/GoogleAnalyticsDetailPage'),
);
const SearchConsoleDetailPage = lazy(
  () => import('./pages/client/SearchConsoleDetailPage'),
);
const InstagramDetailPage = lazy(
  () => import('./pages/client/InstagramDetailPage'),
);
const InstagramReelsPage = lazy(
  () => import('./pages/client/InstagramReelsPage'),
);
const InstagramPostsPage = lazy(
  () => import('./pages/client/InstagramPostsPage'),
);
const PageSpeedDetailPage = lazy(
  () => import('./pages/client/PageSpeedDetailPage'),
);
const ClientTeamPage = lazy(() => import('./pages/client/ClientTeamPage'));
const ClientShootsPage = lazy(() => import('./pages/client/ClientShootsPage'));
const ClientContentPlanPage = lazy(
  () => import('./pages/client/ClientContentPlanPage'),
);
const GoogleAdsDetailPage = lazy(
  () => import('./pages/client/GoogleAdsDetailPage'),
);
const MetaAdsDetailPage = lazy(
  () => import('./pages/client/MetaAdsDetailPage'),
);
const OnboardingPage = lazy(() => import('./pages/client/OnboardingPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 10 * 60 * 1000,   // 10 min — data stays fresh
      gcTime: 30 * 60 * 1000,      // 30 min — keep in memory
    },
  },
});

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  const routes: Record<string, string> = {
    ADMIN: '/admin',
    AGENCY_STAFF: '/staff',
    COMPANY_USER: '/client',
  };
  return <Navigate to={routes[user.globalRole] || '/login'} replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <RouteBoundary>
            <Suspense fallback={<RouteLoadingFallback />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<RoleRedirect />} />

                {/* Admin Panel */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute roles={['ADMIN']}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="analytics" element={<AdminAnalyticsPage />} />
                  <Route path="companies" element={<CompaniesPage />} />
                  <Route path="companies/:id" element={<CompanyDetailPage />} />
                  <Route path="staff" element={<StaffPage />} />
                  <Route path="staff/:id" element={<StaffDetailPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="messaging" element={<MessagingPage />} />
                  <Route path="activity-log" element={<ActivityLogPage />} />
                  <Route path="routines" element={<RoutineManagementPage />} />
                  <Route path="requests" element={<StaffRequestsPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                </Route>

                {/* Staff Panel */}
                <Route
                  path="/staff"
                  element={
                    <ProtectedRoute roles={['ADMIN', 'AGENCY_STAFF']}>
                      <StaffLayout />
                    </ProtectedRoute>
                  }
                >
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
                </Route>

                {/* Client Panel */}
                <Route
                  path="/client"
                  element={
                    <ProtectedRoute roles={['ADMIN', 'COMPANY_USER']}>
                      <ClientLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<ClientDashboard />} />
                  <Route path="analytics" element={<ClientAnalyticsPage />} />
                  <Route path="google-analytics" element={<ServicePageGate service="DIGITAL_MARKETING"><GoogleAnalyticsDetailPage /></ServicePageGate>} />
                  <Route path="search-console" element={<ServicePageGate service="DIGITAL_MARKETING"><SearchConsoleDetailPage /></ServicePageGate>} />
                  <Route path="instagram" element={<ServicePageGate service="SOCIAL_MEDIA"><InstagramDetailPage /></ServicePageGate>} />
                  <Route path="instagram/reels" element={<ServicePageGate service="SOCIAL_MEDIA"><InstagramReelsPage /></ServicePageGate>} />
                  <Route path="instagram/posts" element={<ServicePageGate service="SOCIAL_MEDIA"><InstagramPostsPage /></ServicePageGate>} />
                  <Route path="web-design" element={<ServicePageGate service="WEB_DESIGN"><PageSpeedDetailPage /></ServicePageGate>} />
                  <Route path="media" element={<MediaLibraryPage />} />
                  <Route path="tasks" element={<ClientTasksPage />} />
                  <Route path="completed" element={<Navigate to="/client/tasks" replace />} />
                  <Route path="services" element={<ProtectedRoute membershipRoles={['OWNER']}><ServicesPage /></ProtectedRoute>} />
                  <Route path="messaging" element={<ClientMessagingPage />} />
                  <Route path="team" element={<ProtectedRoute membershipRoles={['OWNER']}><ClientTeamPage /></ProtectedRoute>} />
                  <Route path="surveys" element={<ProtectedRoute membershipRoles={['OWNER']}><SurveyPage /></ProtectedRoute>} />
                  <Route path="onboarding" element={<ProtectedRoute membershipRoles={['OWNER']}><OnboardingPage /></ProtectedRoute>} />
                  <Route path="shoots" element={<ServicePageGate service="PRODUCTION"><ClientShootsPage /></ServicePageGate>} />
                  <Route path="content-plans" element={<ServicePageGate service="CONTENT_MARKETING"><ClientContentPlanPage /></ServicePageGate>} />
                  <Route path="google-ads" element={<ServicePageGate service="AD_MANAGEMENT"><GoogleAdsDetailPage /></ServicePageGate>} />
                  <Route path="meta-ads" element={<ServicePageGate service="AD_MANAGEMENT"><MetaAdsDetailPage /></ServicePageGate>} />
                  <Route path="settings" element={<ClientSettingsPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </RouteBoundary>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
