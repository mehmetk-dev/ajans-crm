interface UserAvatarProps {
    name?: string | null;
    avatarUrl?: string | null;
    className?: string;
    imageClassName?: string;
    fallbackClassName?: string;
}

function initials(name?: string | null) {
    const clean = name?.trim();
    if (!clean) return 'U';
    return clean
        .split(/\s+/)
        .map(part => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

export function UserAvatar({
    name,
    avatarUrl,
    className = 'h-8 w-8 rounded-full',
    imageClassName = '',
    fallbackClassName = 'bg-zinc-800 text-zinc-300',
}: UserAvatarProps) {
    const baseClass = `${className} overflow-hidden shrink-0`;

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={name || 'Kullanıcı'}
                className={`${baseClass} object-cover ${imageClassName}`}
            />
        );
    }

    return (
        <div className={`${baseClass} ${fallbackClassName} flex items-center justify-center font-bold`}>
            {initials(name)}
        </div>
    );
}
