import { FileText } from 'lucide-react';
import { ContentPlanPanel } from '../../features/content-plans';
import { useAuth } from '../../store/AuthContext';

export default function ClientContentPlanPage() {
    const { user } = useAuth();
    if (!user?.companyId) return null;

    return (
        <div className="space-y-6">
            <header className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-6">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10">
                        <FileText className="h-5 w-5 text-violet-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">İçerik Planı</h1>
                        <p className="mt-1 text-xs text-zinc-500">
                            Şirketinize ait içerikleri inceleyin, onaylayın veya revize isteyin.
                        </p>
                    </div>
                </div>
            </header>
            <ContentPlanPanel companyId={user.companyId} readOnly />
        </div>
    );
}
