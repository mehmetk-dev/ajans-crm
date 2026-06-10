import { z } from 'zod';

const optionalText = (max: number) =>
    z.string().trim().max(max).transform(value => value || undefined);

export const prProjectFormSchema = z.object({
    name: z.string().trim().min(1, 'Proje adı zorunludur').max(255),
    companyId: optionalText(100),
    responsibleId: optionalText(100),
    purpose: optionalText(5000),
    startDate: optionalText(30),
    endDate: optionalText(30),
    notes: optionalText(5000),
    memberIds: z.array(z.string()).default([]),
    phases: z.array(z.object({
        name: z.string().trim().min(1, 'Faz adı zorunludur').max(255),
        assignedToId: optionalText(100),
        startDate: optionalText(30),
        endDate: optionalText(30),
        notes: optionalText(5000),
    })).min(1, 'En az bir faz gereklidir'),
});

export interface PrProjectFormValues {
    name: string;
    companyId: string;
    responsibleId: string;
    purpose: string;
    startDate: string;
    endDate: string;
    notes: string;
    memberIds: string[];
    phases: {
        name: string;
        assignedToId: string;
        startDate: string;
        endDate: string;
        notes: string;
    }[];
}
