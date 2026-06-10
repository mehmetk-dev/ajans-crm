import type {
    CreateShootInput,
    ShootDisplayStatus,
    ShootResponse,
} from '../api/shoot.types';

export interface ShootFormValues {
    companyId: string;
    title: string;
    description: string;
    shootDate: string;
    shootTime: string;
    location: string;
    photographerId: string;
    notes: string;
    participants: { userId: string; roleInShoot: string }[];
    equipment: { name: string; quantity: number; notes: string }[];
}

export const defaultShootFormValues: ShootFormValues = {
    companyId: '',
    title: '',
    description: '',
    shootDate: '',
    shootTime: '',
    location: '',
    photographerId: '',
    notes: '',
    participants: [],
    equipment: [{ name: '', quantity: 1, notes: '' }],
};

export function toCreateShootInput(values: ShootFormValues): CreateShootInput {
    return {
        companyId: values.companyId,
        title: values.title.trim(),
        description: values.description.trim() || undefined,
        shootDate: values.shootDate
            ? new Date(`${values.shootDate}T00:00:00`).toISOString()
            : undefined,
        shootTime: values.shootTime || undefined,
        location: values.location.trim() || undefined,
        photographerId: values.photographerId || undefined,
        notes: values.notes.trim() || undefined,
        participants: values.participants
            .filter(participant => participant.userId)
            .map(participant => ({
                userId: participant.userId,
                roleInShoot: participant.roleInShoot.trim() || undefined,
            })),
        equipment: values.equipment
            .filter(item => item.name.trim())
            .map(item => ({
                name: item.name.trim(),
                quantity: item.quantity || 1,
                notes: item.notes.trim() || undefined,
            })),
    };
}

export function getShootDisplayStatus(
    shoot: ShootResponse,
    now = new Date(),
): ShootDisplayStatus {
    if (shoot.status !== 'PLANNED' || !shoot.shootDate) {
        return shoot.status;
    }
    const endOfShootDay = new Date(shoot.shootDate);
    endOfShootDay.setHours(23, 59, 59, 999);
    return endOfShootDay < now ? 'OVERDUE' : 'PLANNED';
}

export function groupShoots(shoots: ShootResponse[]) {
    const grouped: Record<ShootDisplayStatus, ShootResponse[]> = {
        PLANNED: [],
        OVERDUE: [],
        COMPLETED: [],
        CANCELLED: [],
    };
    shoots.forEach(shoot => grouped[getShootDisplayStatus(shoot)].push(shoot));
    return grouped;
}
