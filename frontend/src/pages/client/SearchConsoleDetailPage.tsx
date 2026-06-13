import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, RefreshCw, Search } from 'lucide-react';
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
        status, data, loading, error, refreshing,
        activePreset, showDateMenu, customStart, customEnd, isCustomRange,
        currentRange, devicePieData, countryBarData,
        clickThroughRate,
        setActivePreset, setShowDateMenu,
        setCustomStart, setCustomEnd, setIsCustomRange,
        refresh,
    } = useSCDetailPage();

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
                </div>
            </div>

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
        </div>
    );
}
