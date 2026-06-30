import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Globe,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  useGADetailPage,
  googleAnalyticsApi,
  GADateRangePicker,
  GAOverviewSection,
  GADailyTrendChart,
  GATrafficSourcesCard,
  GACountriesCard,
  GATopPagesSection,
  GASummarySection,
} from "../../features/google-analytics";
import { useAuth } from "../../store/AuthContext";

export default function GoogleAnalyticsDetailPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const companyId = user?.companyId ?? "";
  const {
    status, data, loading, error, refreshing, authLoading,
    activePreset, showDateMenu, customStart, customEnd, isCustomRange,
    currentRange, sourcePieData, countryBarData,
    totalSources, totalPages, maxPageViews,
    engagementRate, sessionsPerUser,
    setActivePreset, setShowDateMenu,
    setCustomStart, setCustomEnd, setIsCustomRange,
    refresh,
  } = useGADetailPage();

  /* Property ID inline formu için state */
  const [propertyInput, setPropertyInput] = useState("");
  const [savingProperty, setSavingProperty] = useState(false);

  /* status gelince mevcut propertyId'yi input'a yaz */
  useEffect(() => {
    if (status?.propertyId) {
      setPropertyInput(status.propertyId);
    }
  }, [status?.propertyId]);

  const handleSaveProperty = useCallback(async () => {
    if (!propertyInput.trim() || !companyId) return;
    setSavingProperty(true);
    try {
      await googleAnalyticsApi.saveProperty(companyId, propertyInput.trim());
      refresh();
    } finally {
      setSavingProperty(false);
    }
  }, [propertyInput, companyId, refresh]);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#F5BEC8] animate-spin" />
          <p className="text-zinc-400 text-sm">
            Google Analytics verileri yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate("/client/analytics")}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Rapora Dön
        </button>
        <div className="bg-[#0C0C0E] border border-red-500/20 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <div>
            <p className="text-lg font-semibold text-white">
              Google Analytics Hatası
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              {error}
            </p>
          </div>
          <button
            onClick={() => refresh()}
            className="bg-[#C8697A] hover:bg-[#B5556A] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  if (!status?.connected) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate("/client/analytics")}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Rapora Dön
        </button>
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-10 h-10 text-zinc-500" />
          <div>
            <p className="text-lg font-semibold text-white">
              Google Analytics Bağlı Değil
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              Google hesabınızı bağladıktan sonra GA4 mülkünüzü seçebilirsiniz.
            </p>
          </div>
          {status?.authUrl ? (
            <a
              href={status.authUrl}
              className="bg-[#C8697A] hover:bg-[#B5556A] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              Google ile Bağlan
            </a>
          ) : (
            <button
              onClick={() => navigate("/client/analytics")}
              className="bg-[#C8697A] hover:bg-[#B5556A] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              Analitik Sayfasına Git
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!status.propertyId) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate("/client/analytics")}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Rapora Dön
        </button>
        <div className="bg-[#0C0C0E] border border-pink-500/20 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
          <CheckCircle2 className="w-10 h-10 text-pink-400" />
          <div>
            <p className="text-lg font-semibold text-white">
              Google Hesabı Bağlandı
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              GA4 mülk ID'nizi girin. GA4 Property ID'nizi{" "}
              <a
                href="https://analytics.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C8697A] hover:underline"
              >
                Google Analytics
              </a>{" "}
              &gt; Yönetici &gt; Mülk Ayarları'ndan bulabilirsiniz.
            </p>
          </div>
          <div className="flex gap-2 w-full max-w-sm">
            <input
              type="text"
              value={propertyInput}
              onChange={(e) => setPropertyInput(e.target.value)}
              placeholder="Örn: 123456789"
              className="flex-1 bg-[#1a1a1f] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C8697A]/50"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveProperty();
              }}
            />
            <button
              onClick={handleSaveProperty}
              disabled={savingProperty || !propertyInput.trim()}
              className="bg-[#C8697A] hover:bg-[#B5556A] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              {savingProperty ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.errorMessage) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate("/client/analytics")}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Rapora Dön
        </button>
        <div className="bg-[#0C0C0E] border border-amber-500/20 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-10 h-10 text-amber-400" />
          <div>
            <p className="text-lg font-semibold text-white">
              Veri Alınamadı
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              {data?.errorMessage || "Google Analytics verileri şu an alınamıyor. Kısa süre sonra tekrar deneyin."}
            </p>
          </div>
          <button
            onClick={() => refresh()}
            className="bg-[#C8697A] hover:bg-[#B5556A] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/client/analytics")}
            className="h-10 w-10 rounded-xl bg-[#0C0C0E] border border-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/[0.12] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <Globe className="w-6 h-6 text-[#F5BEC8]" />
              Google Analytics Raporu
            </h1>
            <p className="text-zinc-500 text-[13px] mt-1">
              GA4 Mülkü: {status.propertyId} — {currentRange.desc} detaylı analiz
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-pink-500/10 border border-pink-500/20 rounded-full px-3 py-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-[11px] text-pink-400 font-medium">Bağlı</span>
          </div>
          <GADateRangePicker
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
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      <GAOverviewSection
        sessions={data.sessions}
        totalUsers={data.totalUsers}
        newUsers={data.newUsers}
        pageViews={data.pageViews}
        currentRangeDesc={currentRange.desc}
        engagementRate={engagementRate}
        sessionsPerUser={sessionsPerUser}
      />

      <GADailyTrendChart data={data.dailyTrend} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GATrafficSourcesCard data={sourcePieData} totalSources={totalSources} />
        <GACountriesCard data={countryBarData} />
      </div>

      <GATopPagesSection
        pages={data.topPages ?? []}
        totalPages={totalPages}
        maxPageViews={maxPageViews}
      />

      <GASummarySection
        totalUsers={data.totalUsers}
        newUsers={data.newUsers}
        sessions={data.sessions}
        pageViews={data.pageViews}
        sourceCount={sourcePieData.length}
        countryCount={countryBarData.length}
        pageCount={(data.topPages ?? []).length}
        engagementRate={engagementRate}
        sessionsPerUser={sessionsPerUser}
      />
    </div>
  );
}
