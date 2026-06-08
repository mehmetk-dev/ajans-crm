export interface Note {
    id: string;
    userId: string;
    userName: string;
    companyId: string | null;
    companyName: string | null;
    content: string;
    isOpen: boolean;
    noteDate: string;
    createdAt: string;
}

export interface CreateNoteInput {
    content: string;
    companyId?: string;
}

export interface NoteFilters {
    page?: number;
    size?: number;
    companyId?: string;
}

export interface NotePage {
    content: Note[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export interface NoteCompanyOption {
    id: string;
    name: string;
}
