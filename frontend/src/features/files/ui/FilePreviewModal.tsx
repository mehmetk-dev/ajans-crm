import { X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fileApi } from '../api/fileApi';
import type { FileAttachmentResponse } from '../api/file.types';
import { formatFileSize, formatFileDate } from '../model/file.utils';
import { UserAvatar } from '../../../components/UserAvatar';

interface FilePreviewModalProps {
    file: FileAttachmentResponse | null;
    onClose: () => void;
}

export default function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
    return (
        <AnimatePresence>
            {file && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.9 }}
                        className="relative max-w-4xl max-h-[85vh] w-full"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute -top-10 right-0 p-1.5 text-zinc-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="bg-[#0C0C0E] rounded-2xl overflow-hidden border border-white/[0.06]">
                            {file.contentType?.startsWith('image/') ? (
                                <img
                                    src={fileApi.getDownloadUrl(file.id)}
                                    alt={file.originalName}
                                    className="w-full max-h-[75vh] object-contain"
                                />
                            ) : file.contentType?.startsWith('video/') ? (
                                <video
                                    src={fileApi.getDownloadUrl(file.id)}
                                    controls
                                    autoPlay
                                    className="w-full max-h-[75vh]"
                                />
                            ) : null}
                            <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white font-medium">{file.originalName}</p>
                                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-zinc-500">
                                        <span>{formatFileSize(file.fileSize)}</span>
                                        <span>·</span>
                                        <UserAvatar name={file.uploadedByName} avatarUrl={file.uploadedByAvatarUrl} className="h-4 w-4 rounded text-[8px]" />
                                        <span>{file.uploadedByName}</span>
                                        <span>·</span>
                                        <span>{formatFileDate(file.createdAt)}</span>
                                    </div>
                                </div>
                                <a
                                    href={fileApi.getDownloadUrl(file.id)}
                                    download
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 text-orange-400 rounded-lg text-xs font-medium hover:bg-orange-500/20 transition-colors"
                                >
                                    <Download className="w-3 h-3" /> İndir
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
