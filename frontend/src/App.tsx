import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './store/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RouteBoundary, { RouteLoadingFallback } from './components/routing/RouteBoundary';
import { adminRoutes } from './app/routes/adminRoutes';
import { staffRoutes } from './app/routes/staffRoutes';
import { clientRoutes } from './app/routes/clientRoutes';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const StaffLayout = lazy(() => import('./layouts/StaffLayout'));
const ClientLayout = lazy(() => import('./layouts/ClientLayout'));
const PrivacyPolicyPage = lazy(() => import('./pages/legal/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/legal/TermsOfServicePage'));
const CookiePolicyPage = lazy(() => import('./pages/legal/CookiePolicyPage'));
const DataProcessingAgreementPage = lazy(() => import('./pages/legal/DataProcessingAgreementPage'));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            staleTime: 10 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
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
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/dashboard" element={<RoleRedirect />} />
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                                <Route path="/terms" element={<TermsOfServicePage />} />
                                <Route path="/cookie-policy" element={<CookiePolicyPage />} />
                                <Route path="/dpa" element={<DataProcessingAgreementPage />} />
                                <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout /></ProtectedRoute>}>
                                    {adminRoutes}
                                </Route>
                                <Route path="/staff" element={<ProtectedRoute roles={['ADMIN', 'AGENCY_STAFF']}><StaffLayout /></ProtectedRoute>}>
                                    {staffRoutes}
                                </Route>
                                <Route path="/client" element={<ProtectedRoute roles={['ADMIN', 'COMPANY_USER']}><ClientLayout /></ProtectedRoute>}>
                                    {clientRoutes}
                                </Route>
                                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            </Routes>
                        </Suspense>
                    </RouteBoundary>
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
}