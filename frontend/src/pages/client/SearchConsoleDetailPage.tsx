import { useState, useEffect, useMemo, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
    BarChart, Bar
} from 'recharts';
import {
    Search, MousePointerClick, Eye, TrendingUp,
    Target, AlertCircle, Loader2, ArrowLeft,
    FileText, CheckCircle2, BarChart3,
    RefreshCw, Calendar, Zap, ChevronDown, MapPin, Monitor
} from 'lucide-react';
import {
    BigMetricCard,
    ChartTooltip,
    DATE_PRESETS,
    SectionHeader,
    buildCountryBarData,
    buildDevicePieData,
    computeClickThroughRate,
    formatNum,
    getPositionLabel,
    searchConsoleApi,
    type ScOverviewResponse,
    type ScStatusResponse,
} from '../../features/search-console';
import { useAuth } from '../../store/AuthContext';

export default function SearchConsoleDetailPage() {
    const fid = useId();
    const navigate = useNavigate();
    const { user } = useAuth();
    const companyId = user?.companyId;

    const [status, setStatus] = useState<ScStatusResponse | null>(null);
    const [data, setData] = useState<ScOverviewResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [activePreset, setActivePreset] = useState(2);
    const [showDateMenu, setShowDateMenu] = useState(false);
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [isCustomRange, setIsCustomRange] = useState(false);

    const currentRange = isCustomRange
        ? { start: customStart, end: customEnd, desc: `${customStart} — ${customEnd}` }
        : DATE_PRESETS[activePreset];

    const load = (showRefresh = false) => {
        if (!companyId) return;
        if (showRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        const startDate = isCustomRange ? customStart : DATE_PRESETS[activePreset].start;
        const endDate = isCustomRange ? customEnd : DATE_PRESETS[activePreset].end;

        searchConsoleApi.getStatus(companyId)
            .then((s: ScStatusResponse) => {
                setStatus(s);
                if (s.connected && s.siteUrl) {
                    return searchConsoleApi.getOverview(companyId, startDate, endDate).then(d => setData(d));
                }
            })
            .catch((err: { response?: { data?: { message?: string } } }) =>
                setError(err?.response?.data?.message || 'Search Console verileri yüklenirken hata oluştu')
            )
            .finally(() => {
                setLoading(false);
                setRefreshing(false);
            });
    };

    useEffect(() => { load(); }, [companyId, activePreset, isCustomRange, customStart, customEnd]);

    const devicePieData = useMemo(() =>
        buildDevicePieData(data?.devices ?? []), [data?.devices]);

    const countryBarData = useMemo(() =>
        buildCountryBarData(data?.countries ?? []), [data?.countries]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
                    <p className="text-zinc-400 text-sm">Search Console verileri yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (error || !status?.connected || !data || data.errorMessage) {
        return (
            <div className="space-y-6">
                <button onClick={() => navigate('/client/analytics')}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> Rapora Dön
                </button>
                <div className="bg-[#0C0C0E] border border-red-500/20 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                    <div>
                        <p className="text-lg font-semibold text-white">Search Console Bağlantı Hatası</p>
                        <p className="text-sm text-zinc-500 mt-1">
                            {error || data?.errorMessage || 'Search Console henüz bağlanmamış. Lütfen önce Analitik sayfasından bağlantıyı yapın.'}
                        </p>
                    </div>
                    <button onClick={() => navigate('/client/analytics')}
                        className="bg-pink-600 hover:bg-pink-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
                        Analitik Sayfasına Git
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/client/analytics')}
                        className="h-10 w-10 rounded-xl bg-[#0C0C0E] border border-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/[0.12] transition-all">
                        <ArrowLeft className="w-4.5 h-4.5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                            <Search className="w-6 h-6 text-pink-400" />
                            Search Console Raporu
                        </h1>
                        <p className="text-zinc-500 text-[13px] mt-1">
                            Site: {status.siteUrl} — {currentRange.desc} detaylı analiz
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-pink-500/10 border border-pink-500/20 rounded-full px-3 py-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />
                        <span className="text-[11px] text-pink-400 font-medium">Bağlı</span>
                    </div>
                    {/* Tarih aralığı seçici */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDateMenu(v => !v)}
                            className="flex items-center gap-1.5 bg-[#0C0C0E] border border-white/[0.06] hover:border-white/[0.12] rounded-full px-3 py-1.5 transition-colors"
                        >
                            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                            <span className="text-[11px] text-zinc-400">
                                {isCustomRange ? `${customStart} — ${customEnd}` : DATE_PRESETS[activePreset].label}
                            </span>
                            <ChevronDown className="w-3 h-3 text-zinc-500" />
                        </button>
                        {showDateMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowDateMenu(false)} />
                                <div className="absolute right-0 top-full mt-2 z-50 bg-[#1a1a1f] border border-white/[0.08] rounded-xl shadow-2xl p-2 min-w-[220px]">
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider px-2 py-1">Hazır Aralıklar</p>
                                    {DATE_PRESETS.map((p, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { setActivePreset(i); setIsCustomRange(false); setShowDateMenu(false); }}
                                            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                                                !isCustomRange && activePreset === i
                                                    ? 'bg-pink-500/10 text-pink-400'
                                                    : 'text-zinc-300 hover:bg-white/[0.05]'
                                            }`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                    <div className="border-t border-white/[0.06] mt-2 pt-2">
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider px-2 py-1">Özel Tarih Aralığı</p>
                                        <div className="px-2 space-y-2 mt-1">
                                            <div>
                                                <label htmlFor={`${fid}-scstart`} className="text-[10px] text-zinc-500">Başlangıç</label>
                                                <input id={`${fid}-scstart`} type="date" value={customStart}
                                                    onChange={e => setCustomStart(e.target.value)}
                                                    className="w-full bg-[#0C0C0E] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500/50" />
                                            </div>
                                            <div>
                                                <label htmlFor={`${fid}-scend`} className="text-[10px] text-zinc-500">Bitiş</label>
                                                <input id={`${fid}-scend`} type="date" value={customEnd}
                                                    onChange={e => setCustomEnd(e.target.value)}
                                                    className="w-full bg-[#0C0C0E] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500/50" />
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (customStart && customEnd) {
                                                        setIsCustomRange(true);
                                                        setShowDateMenu(false);
                                                    }
                                                }}
                                                disabled={!customStart || !customEnd}
                                                className="w-full bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white text-xs font-medium py-1.5 rounded-lg transition-colors"
                                            >
                                                Uygula
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <button
                        onClick={() => load(true)}
                        disabled={refreshing}
                        className="h-8 w-8 rounded-lg bg-[#0C0C0E] border border-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/[0.12] transition-all disabled:opacity-50"
                        title="Verileri Yenile"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* ANA METRİKLER */}
            <section>
                <SectionHeader icon={Zap} title="Genel Bakış" color="bg-pink-500/20">
                    <span className="text-[11px] text-zinc-500">{currentRange.desc} özet veriler</span>
                </SectionHeader>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <BigMetricCard
                        label="Toplam Tıklama"
                        value={formatNum(data.totalClicks)}
                        icon={MousePointerClick}
                        color="text-[#F5BEC8]"
                        bgColor="bg-[#C8697A]/10"
                    />
                    <BigMetricCard
                        label="Toplam Gösterim"
                        value={formatNum(data.totalImpressions)}
                        icon={Eye}
                        color="text-pink-400"
                        bgColor="bg-pink-500/10"
                    />
                    <BigMetricCard
                        label="Ortalama TO (CTR)"
                        value={`%${data.avgCtr}`}
                        icon={TrendingUp}
                        color="text-amber-400"
                        bgColor="bg-amber-500/10"
                    />
                    <BigMetricCard
                        label="Ortalama Sıralama"
                        value={data.avgPosition}
                        icon={Target}
                        color="text-purple-400"
                        bgColor="bg-purple-500/10"
                    />
                </div>
            </section>

            {/* PERFORMANS METRİKLERİ */}
            <section>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-4 h-4 text-[#F5BEC8]" />
                            <span className="text-xs text-zinc-500">Tıklama Oranı (CTR)</span>
                        </div>
                        <p className="text-2xl font-bold text-white">%{data.avgCtr}</p>
                        <div className="mt-3 h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#D1181C] to-[#C8697A] rounded-full transition-all"
                                style={{ width: `${Math.min(data.avgCtr, 100)}%` }} />
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Target className="w-4 h-4 text-purple-400" />
                            <span className="text-xs text-zinc-500">Ortalama Pozisyon</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{data.avgPosition}</p>
                        <p className="text-[11px] text-zinc-600 mt-2">
                            {getPositionLabel(data.avgPosition)}
                        </p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <MousePointerClick className="w-4 h-4 text-amber-400" />
                            <span className="text-xs text-zinc-500">Tıklama / Gösterim</span>
                        </div>
                        <p className="text-2xl font-bold text-white">
                            {computeClickThroughRate(data.totalClicks, data.totalImpressions)}
                        </p>
                        <p className="text-[11px] text-zinc-600 mt-2">Gerçek tıklama oranı</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <BarChart3 className="w-4 h-4 text-pink-400" />
                            <span className="text-xs text-zinc-500">Sorgu Sayısı</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{data.topQueries.length}</p>
                        <p className="text-[11px] text-zinc-600 mt-2">Üst sıralardaki sorgular</p>
                    </motion.div>
                </div>
            </section>

            {/* GÜNLÜK TREND */}
            <section>
                <SectionHeader icon={TrendingUp} title="Günlük Tıklama & Gösterim Trendi" color="bg-pink-500/20" />
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6">
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.dailyTrend}>
                                <defs>
                                    <linearGradient id="detailScClicks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="detailScImpressions" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                <XAxis dataKey="date" stroke="#52525b" tick={{ fontSize: 11, fill: '#71717a' }} />
                                <YAxis yAxisId="left" stroke="#52525b" tick={{ fontSize: 11, fill: '#71717a' }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#52525b" tick={{ fontSize: 11, fill: '#71717a' }} />
                                <Tooltip content={<ChartTooltip />} />
                                <Legend verticalAlign="top" height={36}
                                    formatter={(v: string) => <span className="text-xs text-zinc-400">{v}</span>} />
                                <Area yAxisId="left" type="monotone" dataKey="clicks" name="Tıklama" stroke="#3b82f6"
                                    fill="url(#detailScClicks)" strokeWidth={2} dot={false} />
                                <Area yAxisId="right" type="monotone" dataKey="impressions" name="Gösterim" stroke="#10b981"
                                    fill="url(#detailScImpressions)" strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* EN ÇOK ARANAN SORGULAR */}
            <section>
                <SectionHeader icon={Search} title="En Çok Aranan Sorgular" color="bg-[#C8697A]/20" />
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/[0.06]">
                                    <th className="text-left text-[11px] text-zinc-500 uppercase tracking-wider pb-3 pr-4">#</th>
                                    <th className="text-left text-[11px] text-zinc-500 uppercase tracking-wider pb-3 pr-4">Sorgu</th>
                                    <th className="text-right text-[11px] text-zinc-500 uppercase tracking-wider pb-3 pr-4">Tıklama</th>
                                    <th className="text-right text-[11px] text-zinc-500 uppercase tracking-wider pb-3 pr-4">Gösterim</th>
                                    <th className="text-right text-[11px] text-zinc-500 uppercase tracking-wider pb-3 pr-4">TO</th>
                                    <th className="text-right text-[11px] text-zinc-500 uppercase tracking-wider pb-3">Sıra</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topQueries.map((q, i) => (
                                    <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3 pr-4 text-xs text-zinc-500">{i + 1}</td>
                                        <td className="py-3 pr-4 text-sm text-zinc-200 max-w-[300px] truncate" title={q.query}>{q.query}</td>
                                        <td className="py-3 pr-4 text-sm text-[#F5BEC8] text-right font-medium">{q.clicks.toLocaleString('tr-TR')}</td>
                                        <td className="py-3 pr-4 text-sm text-zinc-400 text-right">{q.impressions.toLocaleString('tr-TR')}</td>
                                        <td className="py-3 pr-4 text-sm text-amber-400 text-right">%{(q.ctr * 100).toFixed(1)}</td>
                                        <td className="py-3 text-sm text-purple-400 text-right">{q.position}</td>
                                    </tr>
                                ))}
                                {data.topQueries.length === 0 && (
                                    <tr><td colSpan={6} className="py-8 text-center text-zinc-600 text-sm">Veri yok</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* EN ÇOK TRAFİK ALAN SAYFALAR */}
            <section>
                <SectionHeader icon={FileText} title="En Çok Trafik Alan Sayfalar" color="bg-cyan-500/20" />
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6">
                    <div className="space-y-3">
                        {data.topPages.length === 0 && <p className="text-sm text-zinc-600 text-center py-6">Veri yok</p>}
                        {data.topPages.map((p, i) => {
                            const maxClicks = data.topPages[0]?.clicks || 1;
                            const pct = Math.round((p.clicks / maxClicks) * 100);
                            return (
                                <div key={i} className="group hover:bg-white/[0.02] rounded-xl p-3 -mx-3 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-zinc-200 truncate max-w-[50%]" title={p.page}>
                                            <span className="text-zinc-500 mr-2">{i + 1}.</span>
                                            {p.page}
                                        </span>
                                        <div className="flex items-center gap-4 text-xs">
                                            <span className="text-[#F5BEC8] font-medium">{p.clicks.toLocaleString('tr-TR')} tıklama</span>
                                            <span className="text-zinc-500">{p.impressions.toLocaleString('tr-TR')} gösterim</span>
                                            <span className="text-amber-400">TO: %{(p.ctr * 100).toFixed(1)}</span>
                                            <span className="text-purple-400">Sıra: {p.position}</span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 0.7, delay: i * 0.05 }}
                                            className="h-full rounded-full bg-cyan-500"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CİHAZLAR + ÜLKELER */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Cihaz Dağılımı */}
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6">
                    <SectionHeader icon={Monitor} title="Cihaz Dağılımı" color="bg-[#C8697A]/20" />
                    {devicePieData.length > 0 ? (
                        <>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={devicePieData} dataKey="value" nameKey="name"
                                            cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                                            paddingAngle={3} strokeWidth={0}>
                                            {devicePieData.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<ChartTooltip />} />
                                        <Legend verticalAlign="bottom" height={36}
                                            formatter={(v: string) => <span className="text-xs text-zinc-400">{v}</span>} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 space-y-2">
                                {devicePieData.map((d) => {
                                    const totalClicks = devicePieData.reduce((a, b) => a + b.value, 0);
                                    return (
                                        <div key={d.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                                                <span className="text-sm text-zinc-300">{d.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-semibold text-white">{d.value.toLocaleString('tr-TR')}</span>
                                                <span className="text-xs text-zinc-500 w-12 text-right">
                                                    %{totalClicks > 0 ? ((d.value / totalClicks) * 100).toFixed(1) : '0'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-40 text-zinc-600 text-sm">Veri yok</div>
                    )}
                </div>

                {/* Ülkeler */}
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6">
                    <SectionHeader icon={MapPin} title="Ülkelere Göre Tıklamalar" color="bg-purple-500/20" />
                    {countryBarData.length > 0 ? (
                        <>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={countryBarData} layout="vertical" margin={{ left: 0, right: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                                        <XAxis type="number" stroke="#52525b" tick={{ fontSize: 11, fill: '#71717a' }} />
                                        <YAxis type="category" dataKey="name" stroke="#52525b" tick={{ fontSize: 12, fill: '#a1a1aa' }}
                                            width={50} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Bar dataKey="value" name="Tıklama" radius={[0, 6, 6, 0]} barSize={20}>
                                            {countryBarData.map((entry, i) => (
                                                <Cell key={i} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 space-y-2">
                                {(data?.countries ?? []).map((c) => {
                                    const totalC = (data?.countries ?? []).reduce((a, b) => a + b.clicks, 0);
                                    return (
                                        <div key={c.name} className="flex items-center justify-between text-sm">
                                            <span className="text-zinc-300">{c.name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold text-white">{c.clicks.toLocaleString('tr-TR')} tıklama</span>
                                                <span className="text-xs text-zinc-500">
                                                    %{totalC > 0 ? ((c.clicks / totalC) * 100).toFixed(1) : '0'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-40 text-zinc-600 text-sm">Veri yok</div>
                    )}
                </div>
            </div>

            {/* Özet */}
            <section className="bg-pink-500/5 border border-pink-500/10 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-5 h-5 text-pink-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-pink-300">Performans Özeti</h3>
                        <p className="text-xs text-zinc-500 mt-1">
                            {currentRange.desc} dönemde siteniz Google'da toplam <strong className="text-white">{formatNum(data.totalImpressions)}</strong> kez gösterildi
                            ve <strong className="text-white">{formatNum(data.totalClicks)}</strong> tıklama aldı.
                            Ortalama sıralama <strong className="text-white">{data.avgPosition}</strong>,
                            tıklama oranı <strong className="text-white">%{data.avgCtr}</strong>.
                            {data.topQueries.length > 0 && (
                                <> En çok tıklanan sorgu: <strong className="text-pink-400">"{data.topQueries[0].query}"</strong>.</>
                            )}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
