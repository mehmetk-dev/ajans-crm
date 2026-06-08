import { useQuery } from '@tanstack/react-query';
import { staffApi } from '../../api/staff';
import { NotesWorkspace } from '../../features/notes';

export default function NotesPage() {
    const { data: companies = [] } = useQuery({
        queryKey: ['staff-companies'],
        queryFn: () => staffApi.getCompanies(),
    });

    return (
        <NotesWorkspace
            companies={companies.map(company => ({
                id: company.id,
                name: company.name,
            }))}
        />
    );
}
