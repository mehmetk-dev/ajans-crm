import type { ContentApprovalDetails } from '../api/contentPlan.types';

export function encodeContentApprovalMetadata(details: ContentApprovalDetails): string {
    return [
        details.shootTitle,
        details.shootDescription,
        details.shootDate,
        details.shootTime,
        details.location,
        details.existingShootId,
    ].map(cleanPart).join('||');
}

export function parseContentApprovalMetadata(metadata?: string | null): ContentApprovalDetails {
    if (!metadata) return {};
    const [shootTitle, shootDescription, shootDate, shootTime, location, existingShootId] =
        metadata.split('||');
    return {
        shootTitle: shootTitle || undefined,
        shootDescription: shootDescription || undefined,
        shootDate: shootDate || undefined,
        shootTime: shootTime || undefined,
        location: location || undefined,
        existingShootId: existingShootId || undefined,
    };
}

function cleanPart(value?: string): string {
    return value?.replaceAll('||', ' ').trim() ?? '';
}
