import {
    Component,
    type ErrorInfo,
    type ReactNode,
} from 'react';
import { Loader2, RefreshCw, TriangleAlert } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class RouteErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    state: ErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('Route yüklenemedi', error, info);
    }

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <div className="min-h-dvh bg-[#09090b] flex items-center justify-center p-6">
                <div className="max-w-md w-full rounded-2xl border border-red-500/20 bg-[#111115] p-6 text-center">
                    <TriangleAlert className="w-7 h-7 text-red-400 mx-auto" />
                    <h1 className="text-base font-semibold text-white mt-4">
                        Sayfa yüklenemedi
                    </h1>
                    <p className="text-sm text-zinc-500 mt-2">
                        Uygulama dosyaları güncellenmiş veya bağlantı kesilmiş olabilir.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center gap-2 mt-5 rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-900"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Yeniden Yükle
                    </button>
                </div>
            </div>
        );
    }
}

export function RouteLoadingFallback() {
    return (
        <div className="min-h-dvh bg-[#09090b] flex items-center justify-center">
            <div className="flex items-center gap-3 text-zinc-500">
                <Loader2 className="w-5 h-5 animate-spin text-[#C8697A]" />
                <span className="text-sm">Sayfa yükleniyor...</span>
            </div>
        </div>
    );
}

export default function RouteBoundary({ children }: ErrorBoundaryProps) {
    const location = useLocation();

    return (
        <RouteErrorBoundary key={location.pathname}>
            {children}
        </RouteErrorBoundary>
    );
}
