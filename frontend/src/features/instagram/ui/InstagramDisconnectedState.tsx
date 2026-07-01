import { ArrowRight, Instagram, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { InstagramDisconnectedCopy } from './instagramDisconnectedCopy';

interface InstagramDisconnectedStateProps extends InstagramDisconnectedCopy {
    href?: string;
    to?: string;
    className?: string;
}

export function InstagramDisconnectedState({
    icon: Icon,
    title,
    message,
    actionLabel,
    href,
    to,
    className = '',
}: InstagramDisconnectedStateProps) {
    const actionClassName = 'mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]';
    const actionContent = (
        <>
            <Instagram className="h-4 w-4" />
            {actionLabel}
            <ArrowRight className="h-4 w-4" />
        </>
    );

    return (
        <div className={`rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-8 text-center ${className}`}>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-pink-500/20 bg-pink-500/10">
                <Icon className="h-6 w-6 text-pink-300" />
            </div>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.05] px-2.5 py-1">
                <Lock className="h-3 w-3 text-zinc-400" />
                <span className="text-[10px] font-semibold uppercase text-zinc-400">
                    Bağlantı Gerekli
                </span>
            </div>
            <h3 className="text-base font-semibold text-white">{title}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
                {message}
            </p>
            {href ? (
                <a href={href} className={actionClassName}>
                    {actionContent}
                </a>
            ) : to ? (
                <Link to={to} className={actionClassName}>
                    {actionContent}
                </Link>
            ) : null}
        </div>
    );
}
