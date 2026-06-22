import { useState } from "react";
import { MissingCompanyState } from "../../components/client/MissingCompanyState";
import { useAuth } from "../../store/AuthContext";
import {
  MediaGallery,
  useCompanyMedia,
  useDeleteFile,
} from "../../features/files";
import type { FileFilterKey } from "../../features/files";

export default function MediaLibraryPage() {
  const { user } = useAuth();
  const companyId = user?.companyId;

  const [filter, setFilter] = useState<FileFilterKey>("");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useCompanyMedia(
    companyId ?? undefined,
    filter,
    page,
  );
  const deleteMutation = useDeleteFile();

  const files = data?.content ?? [];
  const totalPages = data?.page?.totalPages ?? data?.totalPages ?? 0;

  if (!companyId) {
    return <MissingCompanyState description="Medya kütüphanesi şirket bilgisi olan bir müşteri hesabıyla açılmalıdır." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Medya Kütüphanesi</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Görseller, videolar ve belgeler
        </p>
      </div>

      <MediaGallery
        companyId={companyId}
        files={files}
        isLoading={isLoading}
        totalPages={totalPages}
        page={page}
        filter={filter}
        onFilterChange={setFilter}
        onPageChange={setPage}
        onDelete={(id) => deleteMutation.mutate(id)}
      />
    </div>
  );
}
