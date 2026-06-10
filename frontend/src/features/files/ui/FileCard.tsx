import { Download, Eye, Trash2, Video } from 'lucide-react';
import { fileApi } from '../api/fileApi';
import type { FileAttachmentResponse } from '../api/file.types';
import { getFileIcon, isImageType, isVideoType, formatFileSize, formatFileDate } from '../model/file.utils';

interface FileCardProps {
    file: FileAttachmentResponse;
    onPreview: (file: FileAttachmentResponse) => void;
    onDelete: (id: string) => void;
}

export default function FileCard({ file, onPreview, onDelete }: FileCardProps) {
    const Icon = getFileIcon(file.contentType);
    const isImage = isImageType(file.contentType);
    const isVideo = isVideoType(file.contentType);
    const downloadUrl = fileApi.getDownloadUrl(file.id);

    const handleClick = () => {
        if (isImage || isVideo) {
            onPreview(file);
        } else {
            window.open(downloadUrl, '_blank');
        }
    };

    return (
        <div className="group relative bg-[#0C0C0E] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.12] transition-colors">
            <div
                className="aspect-square flex items-center justify-center bg-[#0a0a0b] cursor-pointer"
                onClick={handleClick}
            >
                {isImage ? (
                    <img
                        src={downloadUrl}
                        alt={file.originalName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : isVideo ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <Video className="w-10 h-10 text-violet-400" />
                        <div className="absolute bottom-1 right-1 bg-black/60 text-[9px] text-white px-1 rounded">
                            VIDEO
                        </div>
                    </div>
                ) : (
                    <Icon className="w-10 h-10 text-zinc-600" />
                )}
            </div>

            <div className="p-2">
                <p className="text-[11px] text-zinc-300 truncate" title={file.originalName}>
                    {file.originalName}
                </p>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] text-zinc-600">{formatFileSize(file.fileSize)}</span>
                    <span className="text-[9px] text-zinc-700">{formatFileDate(file.createdAt)}</span>
                </div>
                <p className="text-[9px] text-zinc-700 mt-0.5 truncate">{file.uploadedByName}</p>
            </div>

            <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                    href={downloadUrl}
                    download
                    className="p-1 bg-black/70 rounded-md hover:bg-black/90 transition-colors"
                >
                    <Download className="w-3 h-3 text-white" />
                </a>
                {(isImage || isVideo) && (
                    <button
                        onClick={() => onPreview(file)}
                        className="p-1 bg-black/70 rounded-md hover:bg-black/90 transition-colors"
                    >
                        <Eye className="w-3 h-3 text-white" />
                    </button>
                )}
                <button
                    onClick={() => {
                        if (confirm('Bu dosyayı silmek istediğinizden emin misiniz?')) {
                            onDelete(file.id);
                        }
                    }}
                    className="p-1 bg-black/70 rounded-md hover:bg-red-900/80 transition-colors"
                >
                    <Trash2 className="w-3 h-3 text-red-400" />
                </button>
            </div>
        </div>
    );
}
