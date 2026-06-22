import { Image as ImageIcon, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    PostsColumn,
    ReelsColumn,
    StatsColumn,
} from '../../instagram/ui/InstagramPanel';

interface InstagramAnalyticsPanelProps {
    companyId: string;
}

function PanelLink({ to, children }: { to: string; children: string }) {
    return (
        <Link
            to={to}
            className="flex items-center gap-1 text-[11px] text-zinc-500 transition-colors hover:text-zinc-300"
        >
            {children}
        </Link>
    );
}

export default function InstagramAnalyticsPanel({
    companyId,
}: InstagramAnalyticsPanelProps) {
    return (
        <>
            <StatsColumn companyId={companyId} />
            <div className="mt-6 space-y-6">
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Play className="h-4 w-4 text-pink-400" />
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                Reels
                            </h3>
                        </div>
                        <PanelLink to="/client/instagram/reels">Tümünü Gör</PanelLink>
                    </div>
                    <ReelsColumn companyId={companyId} />
                </div>
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-pink-400" />
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                Gönderiler
                            </h3>
                        </div>
                        <PanelLink to="/client/instagram/posts">Tümünü Gör</PanelLink>
                    </div>
                    <PostsColumn companyId={companyId} />
                </div>
            </div>
        </>
    );
}
