import { useState } from "react";
import { ArrowLeft, Building2, FolderOpen, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  companyApi,
  companyKeys,
  type CompanyResponse,
} from "../../features/company";
import {
  MediaGallery,
  useCompanyMedia,
  useCompanyMediaCounts,
  useDeleteFile,
} from "../../features/files";
import type { FileFilterKey } from "../../features/files";

export default function StaffMediaLibraryPage() {
  const [selectedCompany, setSelectedCompany] =
    useState<CompanyResponse | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FileFilterKey>("");
  const [page, setPage] = useState(0);

  const { data: companies } = useQuery({
    queryKey: companyKeys.staffList(),
    queryFn: companyApi.listStaffAccessible,
  });

  const { data: mediaCounts } = useCompanyMediaCounts();

  const { data: mediaData, isLoading: mediaLoading } = useCompanyMedia(
    selectedCompany?.id,
    filter,
    page,
  );

  const deleteMutation = useDeleteFile();

  const filteredCompanies = (companies ?? []).filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const files = mediaData?.content ?? [];
  const totalPages = mediaData?.page?.totalPages ?? mediaData?.totalPages ?? 0;

  if (!selectedCompany) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Medya Kütüphanesi</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Şirketlerin medya dosyalarını yönetin
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Şirket ara..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#0C0C0E] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/30"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredCompanies.map((company) => (
            <button
              key={company.id}
              onClick={() => {
                setSelectedCompany(company);
                setFilter("");
                setPage(0);
              }}
              className="text-left bg-[#0C0C0E] border border-white/[0.06] rounded-xl p-4 hover:border-orange-500/20 hover:bg-[#131315] transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-orange-400 transition-colors">
                    {company.name}
                  </p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">
                    {company.industry ?? "Sektör belirtilmemiş"}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                <FolderOpen className="w-3 h-3 text-zinc-600" />
                <span className="text-[11px] text-zinc-500">
                  {mediaCounts?.[company.id] ?? 0} dosya
                </span>
              </div>
            </button>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12 text-zinc-600 text-sm">
            {search ? "Sonuç bulunamadı" : "Henüz şirket yok"}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setSelectedCompany(null);
          }}
          className="p-2 bg-white/[0.03] border border-white/[0.06] rounded-lg hover:bg-white/[0.06] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {selectedCompany.name}
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">Medya Kütüphanesi</p>
        </div>
      </div>

      <MediaGallery
        companyId={selectedCompany.id}
        files={files}
        isLoading={mediaLoading}
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
