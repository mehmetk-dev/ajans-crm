import { lazy } from 'react';
import { Navigate, Route } from 'react-router-dom';
import { ServicePageGate } from '../../components/ServiceUpsellOverlay';
import ProtectedRoute from '../../components/ProtectedRoute';

const ClientDashboard = lazy(() => import('../../pages/client/ClientDashboard'));
const MediaLibraryPage = lazy(() => import('../../pages/client/MediaLibraryPage'));
const ClientTasksPage = lazy(() => import('../../pages/client/ClientTasksPage'));
const ServicesPage = lazy(() => import('../../pages/client/ServicesPage'));
const ClientSettingsPage = lazy(() => import('../../pages/client/ClientSettingsPage'));
const ClientMessagingPage = lazy(() => import('../../pages/client/ClientMessagingPage'));
const SurveyPage = lazy(() => import('../../pages/client/SurveyPage'));
const ClientAnalyticsPage = lazy(() => import('../../pages/client/ClientAnalyticsPage'));
const GoogleAnalyticsDetailPage = lazy(() => import('../../pages/client/GoogleAnalyticsDetailPage'));
const SearchConsoleDetailPage = lazy(() => import('../../pages/client/SearchConsoleDetailPage'));
const InstagramDetailPage = lazy(() => import('../../pages/client/InstagramDetailPage'));
const InstagramReelsPage = lazy(() => import('../../pages/client/InstagramReelsPage'));
const InstagramPostsPage = lazy(() => import('../../pages/client/InstagramPostsPage'));
const PageSpeedDetailPage = lazy(() => import('../../pages/client/PageSpeedDetailPage'));
const ClientTeamPage = lazy(() => import('../../pages/client/ClientTeamPage'));
const ClientShootsPage = lazy(() => import('../../pages/client/ClientShootsPage'));
const ClientContentPlanPage = lazy(() => import('../../pages/client/ClientContentPlanPage'));
const GoogleAdsDetailPage = lazy(() => import('../../pages/client/GoogleAdsDetailPage'));
const MetaAdsDetailPage = lazy(() => import('../../pages/client/MetaAdsDetailPage'));
const OnboardingPage = lazy(() => import('../../pages/client/OnboardingPage'));

export const clientRoutes = [
    <Route index key="dashboard" element={<ClientDashboard />} />,
    <Route path="analytics" key="analytics" element={<ClientAnalyticsPage />} />,
    <Route path="google-analytics" key="google-analytics" element={<ServicePageGate service="DIGITAL_MARKETING"><GoogleAnalyticsDetailPage /></ServicePageGate>} />,
    <Route path="search-console" key="search-console" element={<ServicePageGate service="DIGITAL_MARKETING"><SearchConsoleDetailPage /></ServicePageGate>} />,
    <Route path="instagram" key="instagram" element={<ServicePageGate service="SOCIAL_MEDIA"><InstagramDetailPage /></ServicePageGate>} />,
    <Route path="instagram/reels" key="instagram-reels" element={<ServicePageGate service="SOCIAL_MEDIA"><InstagramReelsPage /></ServicePageGate>} />,
    <Route path="instagram/posts" key="instagram-posts" element={<ServicePageGate service="SOCIAL_MEDIA"><InstagramPostsPage /></ServicePageGate>} />,
    <Route path="web-design" key="web-design" element={<ServicePageGate service="WEB_DESIGN"><PageSpeedDetailPage /></ServicePageGate>} />,
    <Route path="media" key="media" element={<MediaLibraryPage />} />,
    <Route path="tasks" key="tasks" element={<ClientTasksPage />} />,
    <Route path="completed" key="completed" element={<Navigate to="/client/tasks" replace />} />,
    <Route path="services" key="services" element={<ProtectedRoute membershipRoles={['OWNER']}><ServicesPage /></ProtectedRoute>} />,
    <Route path="messaging" key="messaging" element={<ClientMessagingPage />} />,
    <Route path="team" key="team" element={<ProtectedRoute membershipRoles={['OWNER']}><ClientTeamPage /></ProtectedRoute>} />,
    <Route path="surveys" key="surveys" element={<ProtectedRoute membershipRoles={['OWNER']}><SurveyPage /></ProtectedRoute>} />,
    <Route path="onboarding" key="onboarding" element={<ProtectedRoute membershipRoles={['OWNER']}><OnboardingPage /></ProtectedRoute>} />,
    <Route path="shoots" key="shoots" element={<ServicePageGate service="PRODUCTION"><ClientShootsPage /></ServicePageGate>} />,
    <Route path="content-plans" key="content-plans" element={<ServicePageGate service="CONTENT_MARKETING"><ClientContentPlanPage /></ServicePageGate>} />,
    <Route path="google-ads" key="google-ads" element={<ServicePageGate service="AD_MANAGEMENT"><GoogleAdsDetailPage /></ServicePageGate>} />,
    <Route path="meta-ads" key="meta-ads" element={<ServicePageGate service="AD_MANAGEMENT"><MetaAdsDetailPage /></ServicePageGate>} />,
    <Route path="settings" key="settings" element={<ClientSettingsPage />} />,
];