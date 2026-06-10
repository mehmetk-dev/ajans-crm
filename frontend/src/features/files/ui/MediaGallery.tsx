import { useState } from "react";
import { Filter, FolderOpen, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import type { FileAttachmentResponse, FileFilterKey } from "../api/file.types";
import { fileKeys } from "../api/fileKeys";
import { FILE_FILTERS, ACCEPTED_MEDIA_TYPES } from "../model/file.constants";
import FileCard from "./FileCard";
import FilePreviewModal from "./FilePreviewModal";
import FileUploader from "./FileUploader";

interface MediaGalleryProps {
  companyId: string;
  files: FileAttachmentResponse[];
  isLoading: boolean;
  totalPages: number;
  page: number;
  filter: FileFilterKey;
  onFilterChange: (filter: FileFilterKey) => void;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
  emptyMessage?: string;
}

export default function MediaGallery({
  companyId,
  files,
  isLoading,
  totalPages,
  page,
  filter,
  onFilterChange,
  onPageChange,
  onDelete,
  emptyMessage = "Henüz medya yok",
}: MediaGalleryProps) {
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [preview, setPreview] = useState<FileAttachmentResponse | null>(null);

  const handleUploadComplete = () => {
    queryClient.invalidateQueries({
      queryKey: fileKeys.companyMedia(companyId, filter, page),
    });
    queryClient.invalidateQueries({ queryKey: fileKeys.companyMediaCounts() });
    setShowUpload(false);
  };

  return (
    <div className="space-y-4">
      {/* Upload toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowUpload((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
        >
          <Upload className="w-4 h-4" /> Dosya Yükle
        </button>
      </div>

      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
              <FileUploader
                entityType="COMPANY"
                entityId={companyId}
                accept={ACCEPTED_MEDIA_TYPES}
                onUploadComplete={handleUploadComplete}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-zinc-600" />
        {FILE_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => {
              onFilterChange(f.key);
              onPageChange(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f.key
                ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                : "bg-white/[0.03] text-zinc-500 border border-white/[0.06] hover:text-zinc-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-[#0C0C0E] rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-12 text-center">
          <div className="h-20 w-20 rounded-2xl bg-[#18181b] flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-10 h-10 text-zinc-600" />
          </div>
          <h3 className="text-lg font-semibold text-white">{emptyMessage}</h3>
          <p className="text-sm text-zinc-500 mt-1">
            Dosya yüklemek için yukarıdaki butonu kullanın
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {files.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onPreview={setPreview}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                page === i
                  ? "bg-orange-500 text-white"
                  : "bg-white/[0.03] text-zinc-500 hover:text-white"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <FilePreviewModal file={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
