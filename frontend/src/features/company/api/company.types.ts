export type GlobalRole = 'ADMIN' | 'AGENCY_STAFF' | 'COMPANY_USER';
export type MembershipRole = 'OWNER' | 'EMPLOYEE' | 'AGENCY_STAFF';
export type PermissionLevel = 'NONE' | 'RESTRICTED' | 'FULL';

export interface MembershipInfo {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    membershipRole: MembershipRole;
    globalRole: GlobalRole;
    avatarUrl: string | null;
}

export interface CompanyResponse {
    id: string;
    kind: string;
    name: string;
    industry?: string | null;
    email?: string | null;
    phone?: string | null;
    logoUrl?: string | null;
    contractStatus?: string | null;
    memberCount: number;
    employeeCount: number;
    staffCount: number;
    taskCount: number;
    createdAt: string;
    members?: MembershipInfo[];
    taxId?: string | null;
    foundedYear?: number | null;
    address?: string | null;
    website?: string | null;
    notes?: string | null;
    socialInstagram?: string | null;
    socialFacebook?: string | null;
    socialTwitter?: string | null;
    socialLinkedin?: string | null;
    socialYoutube?: string | null;
    socialTiktok?: string | null;
    hostingProvider?: string | null;
    domainExpiry?: string | null;
    sslExpiry?: string | null;
    cmsType?: string | null;
    cmsVersion?: string | null;
    themeName?: string | null;
}

export interface CreateCompanyInput {
    name: string;
    industry?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    notes?: string;
    taxId?: string;
    foundedYear?: number;
    socialInstagram?: string;
    socialFacebook?: string;
    socialTwitter?: string;
    socialLinkedin?: string;
    socialYoutube?: string;
    socialTiktok?: string;
    ownerFullName: string;
    ownerEmail: string;
    ownerPassword: string;
    ownerPhone?: string;
    ownerPosition?: string;
    selectedServices?: string[];
}

export interface UpdateCompanyInput {
    name: string;
    industry?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    notes?: string;
    taxId?: string;
    foundedYear?: number;
    vision?: string;
    mission?: string;
    employeeCount?: number;
    socialInstagram?: string;
    socialFacebook?: string;
    socialTwitter?: string;
    socialLinkedin?: string;
    socialYoutube?: string;
    socialTiktok?: string;
    hostingProvider?: string | null;
    domainExpiry?: string | null;
    sslExpiry?: string | null;
    cmsType?: string | null;
    cmsVersion?: string | null;
    themeName?: string | null;
}

export interface CompanyInfrastructureInput {
    hostingProvider?: string | null;
    domainExpiry?: string | null;
    sslExpiry?: string | null;
    cmsType?: string | null;
    cmsVersion?: string | null;
    themeName?: string | null;
}

export interface AddEmployeeInput {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    position?: string;
    department?: string;
}

export interface AssignedCompany {
    membershipId: string;
    companyId: string;
    companyName: string;
    membershipRole: MembershipRole;
}

export interface StaffResponse {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    position?: string | null;
    department?: string | null;
    avatarUrl?: string | null;
    globalRole: GlobalRole;
    assignedCompanies: AssignedCompany[];
}

export interface CreateStaffInput {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    position?: string;
    department?: string;
    initialCompanyId?: string;
}

export interface PermissionResponse {
    id: string | null;
    userId: string;
    companyId: string;
    permissionKey: string;
    level: PermissionLevel;
    createdAt: string | null;
}

export interface UpdatePermissionInput {
    userId: string;
    companyId: string;
    permissionKey: string;
    level: PermissionLevel;
}

export interface TeamMember {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    phone: string | null;
    position: string | null;
    department: string | null;
    membershipRole: MembershipRole;
    companyName: string;
}

export interface TeamResponse {
    agencyStaff: TeamMember[];
    employees: TeamMember[];
}
