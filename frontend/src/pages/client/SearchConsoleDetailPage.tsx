import { useNavigate } from 'react-router-dom';
import {
    AlertCircle, ArrowLeft, CheckCircle2, Link2, Loader2,
    RefreshCw, Search, Unlink, WifiOff,
} from 'lucide-react';
import {
    useSCDetailPage,
    SCDateRangePicker,
    SCOverviewSection,
    SCDailyTrendChart,
    SCTopQueriesTable,
    SCTopPagesList,
    SCDevicesCard,
    SCCountriesCard,
    SCSummarySection,
} from '../../features/search-console';

export default function SearchConsoleDetailPage() {
    const navigate = useNavigate();
    const {
        status, data, snapshotMeta, loading, error, refreshing, authLoading,
        activePreset, showDateMenu, customStart, customEnd, isCustomRange,
        currentRange, devicePieData, countryBarData,
        clickThroughRate,
        sites, selectedSite, loadingSites, savingSiteUrl,
        disconnecting,
        setActivePreset, setShowDateMenu,
        setCustomStart, setCustomEnd, setIsCustomRange,
        setSelectedSite, loadSites, saveSiteUrl,
        disconnect, refresh,
    } = useSCDetailPage();

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
                    <p className="text-zinc-400 text-sm">Search Console verileri yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <button onClick={() => navigate('/client/analytics')}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> Rapora Dön
                </button>
                <div className="bg-[#0C0C0E] border border-red-500/20 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                    <div>
                        <p className="text-lg font-semibold text-white">Search Console Hatası</p>
                        <p className="text-sm text-zinc-500 mt-1">{error}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={refresh}
                            className="bg-pink-600 hover:bg-pink-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
                            Tekrar Dene
                        </button>
                        {status?.authUrl && (
                            <a href={status.authUrl}
                                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
                                <RefreshCw className="w-4 h-4" />
                                Google ile Yeniden Bağlan
                            </a>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Bağlı değil
    if (!status?.connected) {
        return (
            <div className="space-y-6">
                <button onClick={() => navigate('/client/analytics')}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> Rapora Dön
                </button>
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-8">
                    <div className="flex flex-col items-center text-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-zinc-800 flex items-center justify-center">
                            <WifiOff className="w-7 h-7 text-zinc-500" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-lg">Google Search Console Bağlı Değil</h3>
                            <p className="text-zinc-500 text-sm mt-1">
                                Google hesabınızla giriş yaparak Search Console verilerinizi burada bağlayabilirsiniz.
                            </p>
                        </div>
                        {status?.authUrl && (
                            <a href={status.authUrl}
                                className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
                                <Link2 className="w-4 h-4" />
                                Google ile Bağlan
                            </a>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // SC scope eksik — yeniden bağlanmalı
    if (status.needsReconnect) {
        return (
            <div className="space-y-6">
                <button onClick={() => navigate('/client/analytics')}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> Rapora Dön
                </button>
                <div className="bg-[#0C0C0E] border border-amber-500/20 rounded-2xl p-8">
                    <div className="flex flex-col items-center text-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                            <RefreshCw className="w-7 h-7 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-lg">Search Console Erişimi Gerekli</h3>
                            <p className="text-zinc-500 text-sm mt-1">
                                Google hesabınız bağlı ancak Search Console erişim izni eksik.<br />
                                Yeniden bağlanarak Search Console izni verin.
                            </p>
                        </div>
                        {status.authUrl && (
                            <a href={status.authUrl}
                                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
                                <RefreshCw className="w-4 h-4" />
                                Yeniden Bağlan
                            </a>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Bağlı + SC scope var ama site URL seçilmemiş
    if (status.connected && status.hasScScope && !status.siteUrl) {
        return (
            <div className="space-y-6">
                <button onClick={() => navigate('/client/analytics')}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> Rapora Dön
                </button>
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-8">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-pink-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-7 h-7 text-pink-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Google Hesabı Bağlandı</h3>
                            <p className="text-zinc-500 text-sm mt-1">
                                İzlemek istediğiniz siteyi seçin.
                            </p>
                        </div>
                        {loadingSites ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 text-pink-400 animate-spin" />
                                <span className="text-sm text-zinc-400">Siteler yükleniyor...</span>
                            </div>
                        ) : sites.length > 0 ? (
                            <div className="flex flex-col gap-3 w-full max-w-md">
                                <select value={selectedSite}
                                    onChange={e => setSelectedSite(e.target.value)}
                                    className="w-full bg-[#1a1a1f] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 appearance-none cursor-pointer">
                                    {sites.map(s => (
                                        <option key={s.siteUrl} value={s.siteUrl}>
                                            {s.siteUrl} ({s.permissionLevel})
                                        </option>
                                    ))}
                                </select>
                                <button onClick={() => saveSiteUrl()}
                                    disabled={savingSiteUrl || !selectedSite}
                                    className="bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
                                    {savingSiteUrl ? 'Kaydediliyor...' : 'Siteyi Seç'}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-sm text-zinc-400 mb-3">
                                    Search Console'da erişilebilir site bulunamadı.
                                </p>
                                <button onClick={loadSites}
                                    className="flex items-center gap-1.5 text-xs text-pink-400 hover:text-pink-300 transition-colors justify-center">
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    Siteleri Yeniden Yükle
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Bundan sonrası rapor — data olmalı
    if (!data || data.errorMessage) {
        return (
            <div className="space-y-6">
                <button onClick={() => navigate('/client/analytics')}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> Rapora Dön
                </button>
                <div className="bg-[#0C0C0E] border border-amber-500/20 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
                    <AlertCircle className="w-10 h-10 text-amber-400" />
                    <div>
                        <p className="text-lg font-semibold text-white">Veri Alınamadı</p>
                        <p className="text-sm text-zinc-500 mt-1">
                            {data?.errorMessage || 'Search Console verileri şu an alınamıyor. Kısa süre sonra tekrar deneyin.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={refresh}
                            className="bg-pink-600 hover:bg-pink-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
                            Tekrar Dene
                        </button>
                        {status?.authUrl && (
                            <a href={status.authUrl}
                                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
                                <RefreshCw className="w-4 h-4" />
                                Google ile Yeniden Bağlan
                            </a>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const hasPerformanceData = data.totalClicks > 0
        || data.totalImpressions > 0
        || data.dailyTrend.length > 0
        || data.topQueries.length > 0
        || data.topPages.length > 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/client/analytics')}
                        className="h-10 w-10 rounded-xl bg-[#0C0C0E] border border-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/[0.12] transition-all">
                        <ArrowLeft className="w-4 h-4" />
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
                    {snapshotMeta && (
                        <div className={`rounded-full border px-3 py-1.5 text-[11px] font-medium ${
                            snapshotMeta.status === 'FAILED'
                                ? 'border-amber-500/20 bg-amber-500/10 text-amber-300'
                                : 'border-white/[0.06] bg-[#0C0C0E] text-zinc-400'
                        }`}>
                            {snapshotMeta.status === 'FAILED'
                                ? 'Son başarılı veri korunuyor'
                                : snapshotMeta.lastSyncedAt
                                    ? `Son güncelleme: ${new Date(snapshotMeta.lastSyncedAt).toLocaleString('tr-TR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}`
                                    : 'Veriler hazırlanıyor'}
                        </div>
                    )}
                    <SCDateRangePicker
                        isCustomRange={isCustomRange}
                        activePreset={activePreset}
                        customStart={customStart}
                        customEnd={customEnd}
                        showDateMenu={showDateMenu}
                        onToggleMenu={() => setShowDateMenu(!showDateMenu)}
                        onSelectPreset={(i) => {
                            setActivePreset(i);
                            setIsCustomRange(false);
                            setShowDateMenu(false);
                        }}
                        onSetCustomStart={setCustomStart}
                        onSetCustomEnd={setCustomEnd}
                        onApplyCustomRange={() => {
                            if (customStart && customEnd) {
                                setIsCustomRange(true);
                                setShowDateMenu(false);
                            }
                        }}
                        onCloseMenu={() => setShowDateMenu(false)}
                    />
                    <button
                        onClick={() => refresh()}
                        disabled={refreshing}
                        className="h-8 w-8 rounded-lg bg-[#0C0C0E] border border-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/[0.12] transition-all disabled:opacity-50"
                        title="Verileri Yenile"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('Search Console bağlantısını kesmek istediğinizden emin misiniz?')) {
                                disconnect();
                            }
                        }}
                        disabled={disconnecting}
                        className="h-8 px-3 rounded-lg bg-[#0C0C0E] border border-red-500/20 flex items-center justify-center gap-1.5 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50 text-[11px] font-medium"
                        title="Bağlantıyı Kes"
                    >
                        {disconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-3.5 h-3.5" />}
                        Kes
                    </button>
                </div>
            </div>

            {!hasPerformanceData ? (
                <div className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] px-6 py-12 text-center">
                    <Search className="mx-auto h-8 w-8 text-zinc-600" />
                    <h2 className="mt-4 text-base font-semibold text-white">Bu tarih aralığında veri yok</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        Search Console performans verileri birkaç gün gecikmeli yayınlanabilir.
                    </p>
                </div>
            ) : (
                <>
                    <SCOverviewSection
                        totalClicks={data.totalClicks}
                        totalImpressions={data.totalImpressions}
                        avgCtr={data.avgCtr}
                        avgPosition={data.avgPosition}
                        currentRangeDesc={currentRange.desc}
                        clickThroughRate={clickThroughRate}
                        topQueryCount={data.topQueries.length}
                    />

                    <SCDailyTrendChart data={data.dailyTrend} />

                    <SCTopQueriesTable queries={data.topQueries} />

                    <SCTopPagesList pages={data.topPages} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <SCDevicesCard data={devicePieData} />
                        <SCCountriesCard data={countryBarData} countries={data.countries} />
                    </div>

                    <SCSummarySection
                        totalImpressions={data.totalImpressions}
                        totalClicks={data.totalClicks}
                        avgPosition={data.avgPosition}
                        avgCtr={data.avgCtr}
                        topQuery={data.topQueries[0]?.query ?? null}
                    />
                </>
            )}
        </div>
    );
}
