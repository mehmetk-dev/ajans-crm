import { motion } from 'framer-motion';
import {
    CheckCircle2, Clock, AlertTriangle, Camera, Rocket, Users, Calendar,
    ArrowRight, Target, TrendingUp,
    MapPin, Pencil, Sun, Moon, Coffee, Sunrise
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { TaskDetailPanel } from '../../features/tasks';
import { QuickNotes } from '../../features/notes';
import {
    useKanbanData,
    TaskMiniCard,
    ShootMiniCard,
    QuickStat,
    WeekStrip,
    getGreeting,
    MOTIVATIONAL,
    dateToKey,
    toLocalDateKey,
    parseLocalDateKey,
    formatTime,
    formatDateShort,
} from '../../features/kanban';
import { UserAvatar } from '../../components/UserAvatar';

/* ─── Greeting Icon ─── */
function GreetingIcon({ type }: { type: 'moon' | 'sunrise' | 'sun' | 'coffee' }) {
    switch (type) {
        case 'moon': return <Moon className="w-5 h-5 text-indigo-400" />;
        case 'sunrise': return <Sunrise className="w-5 h-5 text-amber-400" />;
        case 'sun': return <Sun className="w-5 h-5 text-orange-400" />;
        case 'coffee': return <Coffee className="w-5 h-5 text-violet-400" />;
    }
}

/* ─── Empty State Card ─── */
function EmptyCard({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6 text-center">
            {icon}
            <p className="text-xs text-zinc-600">{label}</p>
        </div>
    );
}

/* ─── Main Page ─── */
export default function KanbanPage() {
    const {
        user, selectedTask, setSelectedTask, selectedDay, setSelectedDay,
        avatarInputRef, avatarMutation, handleAvatarChange,
        isLoading,
        allTasks, allShoots, allMeetings,
        activeTasks, overdueTasks, todayTasks, todayShoots,
        upcomingShoots, upcomingMeetings, activePr,
        completionRate, handleTaskStatusChange,
    } = useKanbanData();

    const greeting = getGreeting();
    const quote = MOTIVATIONAL[new Date().getDate() % MOTIVATIONAL.length];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin h-6 w-6 border-2 border-pink-400 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl">
            {/* ─── Hero Greeting ─── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#0C0C0E] to-[#0a0a0c] border border-white/[0.06] rounded-2xl p-6 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-72 h-72 bg-pink-500/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex items-start gap-5">
                    {/* Avatar */}
                    <div className="relative shrink-0 group">
                        <UserAvatar
                            name={user?.fullName}
                            avatarUrl={user?.avatarUrl}
                            className="h-16 w-16 rounded-2xl border-2 border-white/[0.08] text-xl"
                            fallbackClassName="bg-gradient-to-br from-pink-500/20 to-pink-500/20 text-pink-400"
                        />
                        <button
                            onClick={() => avatarInputRef.current?.click()}
                            disabled={avatarMutation.isPending}
                            className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-pink-500 hover:bg-pink-600 flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Pencil className="w-3 h-3" />
                        </button>
                        <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <GreetingIcon type={greeting.iconType} />
                            <span className="text-sm text-zinc-500">{greeting.text}</span>
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight">
                            {user?.fullName ?? 'Kullanıcı'}
                        </h1>
                        <p className="text-sm text-zinc-600 mt-1 italic">"{quote}"</p>

                    {/* Today summary */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {todayShoots.length > 0 && (
                            <div className="flex items-center gap-2 bg-blue-500/[0.08] border border-blue-500/20 rounded-xl px-3 py-2">
                                <Camera className="w-3.5 h-3.5 text-blue-400" />
                                <span className="text-xs text-blue-300"><strong>{todayShoots.length}</strong> çekim bugün</span>
                            </div>
                        )}
                        {todayTasks.length > 0 && (
                            <div className="flex items-center gap-2 bg-amber-500/[0.08] border border-amber-500/20 rounded-xl px-3 py-2">
                                <Target className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-xs text-amber-300"><strong>{todayTasks.length}</strong> görev bugün bitmeli</span>
                            </div>
                        )}
                        {overdueTasks.length > 0 && (
                            <div className="flex items-center gap-2 bg-red-500/[0.08] border border-red-500/20 rounded-xl px-3 py-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                                <span className="text-xs text-red-300"><strong>{overdueTasks.length}</strong> gecikmiş görev</span>
                            </div>
                        )}
                        {todayShoots.length === 0 && todayTasks.length === 0 && overdueTasks.length === 0 && (
                            <div className="flex items-center gap-2 bg-pink-500/[0.08] border border-pink-500/20 rounded-xl px-3 py-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />
                                <span className="text-xs text-pink-300">Bugün için acil bir şey yok, rahat çalışabilirsin!</span>
                            </div>
                        )}
                    </div>
                    </div>
                </div>
            </motion.div>

            {/* ─── Quick Stats ─── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <QuickStat icon={<Target className="w-4 h-4 text-blue-400" />} label="Aktif Görev" value={activeTasks.length} accent="bg-blue-500/10" delay={0} />
                <QuickStat icon={<Camera className="w-4 h-4 text-violet-400" />} label="Yaklaşan Çekim" value={upcomingShoots.length} accent="bg-violet-500/10" delay={0.1} />
                <QuickStat icon={<TrendingUp className="w-4 h-4 text-pink-400" />} label="Tamamlama" value={`%${completionRate}`} accent="bg-pink-500/10" delay={0.15} />
            </div>

            {/* ─── Week Strip ─── */}
            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-500" />
                    Haftalık Görünüm
                    <span className="text-[10px] text-zinc-600 ml-auto flex items-center gap-2">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Çekim</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Görev</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> Toplantı</span>
                    </span>
                </h3>
                <WeekStrip shoots={allShoots} tasks={allTasks} meetings={allMeetings} selectedDay={selectedDay} onSelectDay={setSelectedDay} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ─── Overdue Tasks ─── */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            {selectedDay ? `${parseLocalDateKey(selectedDay).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })} — Görevler` : 'Gecikmiş Görevler'}
                        </h2>
                        <div className="flex items-center gap-2">
                            {selectedDay && (
                                <button onClick={() => setSelectedDay(null)} className="text-zinc-500 hover:text-zinc-300 text-[10px] bg-white/[0.04] px-2 py-0.5 rounded-md transition-colors">
                                    Genel Görünüm
                                </button>
                            )}
                            <Link to="/staff/tasks" className="text-pink-400 hover:text-pink-300 text-xs flex items-center gap-0.5 transition-colors">
                                Tümü <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                    {selectedDay ? (() => {
                        const dayTasks = allTasks.filter(t => dateToKey(t.endDate) === selectedDay);
                        const dayOverdue = dayTasks.filter(t => t.status !== 'DONE' && dateToKey(t.endDate) < toLocalDateKey(new Date()));
                        const dayPending = dayTasks.filter(t => t.status !== 'DONE' && !dayOverdue.includes(t));
                        const dayDone = dayTasks.filter(t => t.status === 'DONE');
                        const hasAny = dayTasks.length > 0;

                        if (!hasAny) return <EmptyCard icon={<CheckCircle2 className="w-8 h-8 text-zinc-700/30 mx-auto mb-2" />} label="Bu gün için görev yok" />;

                        return (
                            <div className="space-y-3">
                                {/* Day summary banner */}
                                {dayDone.length === dayTasks.length ? (
                                    <div className="flex items-center gap-2 bg-pink-500/[0.08] border border-pink-500/20 rounded-xl px-3 py-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />
                                        <span className="text-xs text-pink-300">Tüm görevler tamamlandı!</span>
                                    </div>
                                ) : dayOverdue.length > 0 ? (
                                    <div className="flex items-center gap-2 bg-red-500/[0.08] border border-red-500/20 rounded-xl px-3 py-2">
                                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                                        <span className="text-xs text-red-300"><strong>{dayOverdue.length}</strong> gecikmiş görev var</span>
                                    </div>
                                ) : null}

                                {/* Overdue */}
                                {dayOverdue.map(task => (
                                    <div key={task.id} onClick={() => setSelectedTask(task)} className="flex items-center gap-3 bg-red-500/[0.06] border border-red-500/15 rounded-xl px-4 py-3 cursor-pointer hover:border-red-500/30 transition-colors">
                                    <div className={`w-1 h-8 rounded-full bg-gradient-to-b from-pink-500 to-pink-700`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white font-medium truncate">{task.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {task.companyName && <span className="text-[10px] text-zinc-600">{task.companyName}</span>}
                                                {task.endTime && <span className="text-[10px] text-zinc-500 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{formatTime(task.endTime)}</span>}
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">GECİKMİŞ</span>
                                    </div>
                                ))}

                                {/* Pending */}
                                {dayPending.map(task => (
                                    <TaskMiniCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                                ))}

                                {/* Done */}
                                {dayDone.map(task => (
                                    <div key={task.id} onClick={() => setSelectedTask(task)} className="flex items-center gap-3 bg-pink-500/[0.03] border border-pink-500/10 rounded-xl px-4 py-3 cursor-pointer hover:border-pink-500/20 transition-colors opacity-60">
                                        <CheckCircle2 className="w-4 h-4 text-pink-500 shrink-0" />
                                        <p className="text-sm text-zinc-400 font-medium truncate line-through flex-1">{task.title}</p>
                                        {task.companyName && <span className="text-[10px] text-zinc-600">{task.companyName}</span>}
                                    </div>
                                ))}
                            </div>
                        );
                    })() : (
                        overdueTasks.length === 0 ? (
                            <EmptyCard icon={<CheckCircle2 className="w-8 h-8 text-pink-500/30 mx-auto mb-2" />} label="Gecikmiş görev yok" />
                        ) : (
                            <div className="space-y-1.5">
                                {overdueTasks.slice(0, 5).map(task => (
                                    <TaskMiniCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                                ))}
                            </div>
                        )
                    )}
                </div>

                {/* ─── Shoots & Meetings for selected day, or default ─── */}
                <div className="space-y-4">
                    {selectedDay ? (() => {
                        const dayShoots = allShoots.filter(s => dateToKey(s.shootDate) === selectedDay);
                        const dayMeetings = allMeetings.filter(m => m.meetingDate && dateToKey(m.meetingDate) === selectedDay);
                        return (
                            <>
                                {/* Day Shoots */}
                                <div className="space-y-3">
                                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                                        <Camera className="w-4 h-4 text-blue-400" />
                                        Çekimler
                                        {dayShoots.length > 0 && <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-md">{dayShoots.length}</span>}
                                    </h2>
                                    {dayShoots.length === 0 ? (
                                        <EmptyCard icon={<Camera className="w-6 h-6 text-zinc-700/30 mx-auto mb-1" />} label="Bu gün çekim yok" />
                                    ) : (
                                        <div className="space-y-1.5">
                                            {dayShoots.map(shoot => <ShootMiniCard key={shoot.id} shoot={shoot} />)}
                                        </div>
                                    )}
                                </div>

                                {/* Day Meetings */}
                                <div className="space-y-3">
                                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                                        <Users className="w-4 h-4 text-cyan-400" />
                                        Toplantılar
                                        {dayMeetings.length > 0 && <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded-md">{dayMeetings.length}</span>}
                                    </h2>
                                    {dayMeetings.length === 0 ? (
                                        <EmptyCard icon={<Users className="w-6 h-6 text-zinc-700/30 mx-auto mb-1" />} label="Bu gün toplantı yok" />
                                    ) : (
                                        <div className="space-y-1.5">
                                            {dayMeetings.map(m => (
                                                <div key={m.id} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3">
                                                    <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                                                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-white font-medium truncate">{m.title}</p>
                                                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-500">
                                                            {m.location && <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{m.location}</span>}
                                                            {m.durationMinutes && <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{m.durationMinutes} dk</span>}
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] text-zinc-600">{m.companyName || 'Ajans İçi'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        );
                    })() : (
                        /* Default: Upcoming Shoots */
                        <>
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-blue-400" />
                                    Yaklaşan Çekimler
                                </h2>
                                <Link to="/staff/shoots" className="text-pink-400 hover:text-pink-300 text-xs flex items-center gap-0.5 transition-colors">
                                    Tümü <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                            {upcomingShoots.length === 0 ? (
                                <EmptyCard icon={<Camera className="w-8 h-8 text-zinc-700/30 mx-auto mb-2" />} label="Yaklaşan çekim yok" />
                            ) : (
                                <div className="space-y-1.5">
                                    {upcomingShoots.slice(0, 5).map(shoot => (
                                        <ShootMiniCard key={shoot.id} shoot={shoot} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ─── Meetings & PR — only in default (non-day) view ─── */}
            {!selectedDay && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ─── Upcoming Meetings ─── */}
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-cyan-400" />
                        Yaklaşan Toplantılar
                    </h2>
                    {upcomingMeetings.length === 0 ? (
                        <EmptyCard icon={<Users className="w-8 h-8 text-zinc-700/30 mx-auto mb-2" />} label="Planlanmış toplantı yok" />
                    ) : (
                        <div className="space-y-1.5">
                            {upcomingMeetings.slice(0, 4).map(m => (
                                <div key={m.id} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3">
                                    <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white font-medium truncate">{m.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-500">
                                            <span className="flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" />{formatDateShort(m.meetingDate)}</span>
                                            {m.location && <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{m.location}</span>}
                                            {m.durationMinutes && <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{m.durationMinutes} dk</span>}
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-zinc-600">{m.companyName}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ─── Active PR Projects ─── */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                            <Rocket className="w-4 h-4 text-pink-400" />
                            Aktif Projeler
                        </h2>
                        <Link to="/staff/pr" className="text-pink-400 hover:text-pink-300 text-xs flex items-center gap-0.5 transition-colors">
                            Tümü <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {activePr.length === 0 ? (
                        <EmptyCard icon={<Rocket className="w-8 h-8 text-zinc-700/30 mx-auto mb-2" />} label="Aktif proje yok" />
                    ) : (
                        <div className="space-y-1.5">
                            {activePr.slice(0, 4).map(pr => (
                                <Link key={pr.id} to="/staff/pr" className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 hover:border-white/[0.10] transition-colors">
                                    <div className="h-8 w-8 rounded-lg bg-pink-500/10 flex items-center justify-center shrink-0">
                                        <Rocket className="w-3.5 h-3.5 text-pink-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white font-medium truncate">{pr.name}</p>
                                        <p className="text-[10px] text-zinc-500 mt-0.5">{pr.companyName} · Faz {pr.currentPhase}/{pr.totalPhases}</p>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="w-16 shrink-0">
                                        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all" style={{ width: `${pr.progressPercent}%` }} />
                                        </div>
                                        <p className="text-[9px] text-zinc-600 text-right mt-0.5">%{pr.progressPercent}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            )}

            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                <QuickNotes limit={10} />
            </div>

            <TaskDetailPanel
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                onStatusChange={handleTaskStatusChange}
            />
        </div>
    );
}
