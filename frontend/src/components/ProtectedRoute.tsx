import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../store/AuthContext';
import { RouteLoadingFallback } from './routing/RouteBoundary';

interface Props {
    children: ReactNode;
    roles?: string[];
    membershipRoles?: string[];
}

export default function ProtectedRoute({ children, roles, membershipRoles }: Props) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <RouteLoadingFallback />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user.globalRole)) {
        // Redirect based on role
        const roleRoutes: Record<string, string> = {
            ADMIN: '/admin',
            AGENCY_STAFF: '/staff',
            COMPANY_USER: '/client',
        };
        return <Navigate to={roleRoutes[user.globalRole] || '/'} replace />;
    }

    if (membershipRoles && (!user.membershipRole || !membershipRoles.includes(user.membershipRole))) {
        return <Navigate to="/client" replace />;
    }

    return <>{children}</>;
}
