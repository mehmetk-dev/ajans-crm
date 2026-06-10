import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Rocket, X } from 'lucide-react';
import type { PrProjectResponse } from '../api/prProject.types';
import { usePrProjects } from '../hooks/usePrProjects';
import { PrProjectCard } from './PrProjectCard';
import { PrProjectDetailPanel } from './PrProjectDetailPanel';
import { PrProjectForm } from './PrProjectForm';

export function PrProjectsWorkspace() {
    const [showCreate, setShowCreate] = useState(false);
    const [selectedProject, setSelectedProject] =
        useState<PrProjectResponse | null>(null);
    const { data, isLoading, isError } = usePrProjects();
    const projects = data?.content ?? [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">
                        PR Projeleri
                    </h1>
                    <p className="text-zinc-600 text-sm mt-1">
                        Aktif PR kampanyaları ve aşamaları
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600"
                >
                    <Plus className="w-4 h-4" />
                    Yeni Proje
                </button>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin h-8 w-8 border-2 border-orange-400 border-t-transparent rounded-full" />
                </div>
            )}

            {isError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-300">
                    PR projeleri yüklenemedi.
                </div>
            )}

            {!isLoading && !isError && projects.length === 0 && (
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-12 text-center">
                    <Rocket className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-white">
                        Henüz PR projesi yok
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">
                        Yeni proje eklemek için butona tıklayın
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project, index) => (
                    <PrProjectCard
                        key={project.id}
                        project={project}
                        index={index}
                        onClick={() => setSelectedProject(project)}
                    />
                ))}
            </div>

            <PrProjectDetailPanel
                project={selectedProject}
                onChange={setSelectedProject}
                onClose={() => setSelectedProject(null)}
            />

            <AnimatePresence>
                {showCreate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-10 overflow-y-auto"
                        onClick={() => setShowCreate(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-[#0C0C0E] border border-white/[0.08] rounded-2xl w-full max-w-2xl p-5"
                            onClick={event => event.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold text-white">Yeni PR Projesi</h2>
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(false)}
                                    className="p-1.5 text-zinc-500 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <PrProjectForm onSuccess={() => setShowCreate(false)} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
