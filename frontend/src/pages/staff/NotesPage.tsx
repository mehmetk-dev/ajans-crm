import { useStaffCompanies } from '../../features/company';
import { NotesWorkspace } from '../../features/notes';

export default function NotesPage() {
    const { data: companies = [] } = useStaffCompanies();

    return (
        <NotesWorkspace
            companies={companies.map(company => ({
                id: company.id,
                name: company.name,
            }))}
        />
    );
}
