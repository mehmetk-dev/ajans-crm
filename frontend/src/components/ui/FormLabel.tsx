import { useId, type ReactNode } from 'react';

const labelCls = 'text-[10px] font-bold text-zinc-500 uppercase tracking-widest';

interface FormLabelProps {
    children: ReactNode;
    htmlFor?: string;
    className?: string;
}

export function FormLabel({ children, htmlFor, className }: FormLabelProps) {
    return <label htmlFor={htmlFor} className={`${labelCls} ${className ?? ''}`.trim()}>{children}</label>;
}

export function useFieldId(prefix: string) {
    const baseId = useId();
    return `${prefix}-${baseId.replace(/:/g, '')}`;
}