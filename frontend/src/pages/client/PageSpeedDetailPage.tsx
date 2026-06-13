import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  ExternalLink,
  Gauge,
  Globe2,
  Loader2,
  Monitor,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import type {
  PageSpeedReport,
  PageSpeedScore,
  Strategy,
} from "../../features/web-design";
import {
  averageScore,
  ConnectionCard,
  DeviceCompareCard,
  formatCls,
  formatDate,
  formatMs,
  HealthSummary,
  normalizeInputUrl,
  ReadinessRow,
  ScoreInsightCard,
  VitalCard,
  webDesignApi,
} from "../../features/web-design";

export default function PageSpeedDetailPage() {
  const navigate = useNavigate();
  const [report, setReport] = useState<PageSpeedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [strategy, setStrategy] = useState<Strategy>("mobile");
  const [websiteInput, setWebsiteInput] = useState("");
  const [formError, setFormError] = useState("");

  const score: PageSpeedScore | undefined =
    strategy === "mobile" ? report?.mobile : report?.desktop;
  const normalizedInput = useMemo(
    () => normalizeInputUrl(websiteInput),
    [websiteInput],
  );
  const mobileAverage = averageScore(report?.mobile);
  const desktopAverage = averageScore(report?.desktop);

  const loadReport = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await webDesignApi.getMyPageSpeed(refresh);
      setReport(data);
      setWebsiteInput(data.websiteUrl ?? "");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleSaveWebsite = async () => {
    setFormError("");
    if (!normalizedInput) {
      setFormError("Web sitesi adresi giriniz.");
      return;
    }
    setSaving(true);
    try {
      const data = await webDesignApi.updateMyWebsite(normalizedInput);
      setReport(data);
      setWebsiteInput(data.websiteUrl ?? normalizedInput);
    } catch {
      setFormError(
        "Web sitesi kaydedilemedi. Adresi kontrol edip tekrar deneyin.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-500 text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          Web Tasarım verileri yükleniyor...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate("/client/analytics")}
            className="h-10 w-10 rounded-xl bg-[#0C0C0E] border border-white/[0.06] text-zinc-400 hover:text-white flex items-center justify-center"
            title="Geri"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Gauge className="w-6 h-6 text-[#F5BEC8]" /> Site Sağlık Merkezi
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Site hızı, kullanıcı deneyimi, SEO ve Google bağlantılarını
              anlaşılır kartlarla takip edin.
            </p>
          </div>
        </div>
        <button
          onClick={() => loadReport(true)}
          disabled={refreshing || !report?.websiteUrl}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#0C0C0E] border border-white/[0.06] text-sm text-zinc-300 hover:text-white disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />{" "}
          Verileri Yenile
        </button>
      </div>

      {/* Site connection form */}
      <section className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe2 className="w-4 h-4 text-[#F5BEC8]" />
          <h2 className="text-sm font-semibold text-zinc-200">
            Site Bağlantısı
          </h2>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={websiteInput}
            onChange={(e) => setWebsiteInput(e.target.value)}
            placeholder="https://ornek.com"
            className="flex-1 h-11 rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 text-sm text-white outline-none focus:border-[#C8697A]/50"
          />
          <button
            onClick={handleSaveWebsite}
            disabled={saving}
            className="h-11 px-5 rounded-xl bg-[#C8697A] hover:bg-[#B5556A] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Bağlantıyı Kaydet
          </button>
        </div>
        {formError && <p className="text-xs text-red-400 mt-2">{formError}</p>}
        {report?.websiteUrl && (
          <a
            href={report.websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#F5BEC8] hover:text-white"
          >
            {report.websiteUrl} <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </section>

      {/* Health + Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4">
        <HealthSummary score={score} strategy={strategy} />
        <section className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#F5BEC8]" />
            <h2 className="text-sm font-semibold text-zinc-200">
              Hazırlık Kontrolü
            </h2>
          </div>
          <ReadinessRow
            done={Boolean(report?.websiteUrl)}
            label="Web sitesi tanımlı"
            detail={
              report?.websiteUrl ??
              "Site adresi eklenmeden sağlık takibi başlayamaz."
            }
          />
          <ReadinessRow
            done={Boolean(report?.searchConsoleConnected)}
            label="Search Console bağlı"
            detail={
              report?.searchConsoleConnected
                ? "Arama performansı okunabilir."
                : "Google arama verileri için bağlantı bekleniyor."
            }
          />
          <ReadinessRow
            done={Boolean(report?.analyticsConnected)}
            label="Google Analytics bağlı"
            detail={
              report?.analyticsConnected
                ? "Ziyaretçi davranışları okunabilir."
                : "Trafik ve kullanıcı verileri için bağlantı bekleniyor."
            }
          />
          <ReadinessRow
            done={mobileAverage != null || desktopAverage != null}
            label="PageSpeed ölçümü"
            detail={
              mobileAverage != null || desktopAverage != null
                ? "Mobil veya masaüstü skorları alındı."
                : "Google PageSpeed skoru henüz alınamadı."
            }
          />
        </section>
      </div>

      {/* Connection cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <ConnectionCard
          active={Boolean(report?.websiteUrl)}
          icon={Globe2}
          label="Web Sitesi"
          value={report?.websiteUrl ?? "Tanımlı değil"}
          healthyText="Sağlık ölçümü için site adresi hazır."
          missingText="Önce site adresi eklenmeli."
        />
        <ConnectionCard
          active={Boolean(report?.searchConsoleConnected)}
          icon={Search}
          label="Search Console"
          value={report?.searchConsoleSiteUrl ?? "Bağlantı yok"}
          healthyText="Google arama verileri panelde kullanılabilir."
          missingText="Arama verileri görünmez."
        />
        <ConnectionCard
          active={Boolean(report?.analyticsConnected)}
          icon={BarChart3}
          label="Google Analytics"
          value={
            report?.gaPropertyId ? `GA4 ${report.gaPropertyId}` : "Bağlantı yok"
          }
          healthyText="Ziyaretçi verileri panelde kullanılabilir."
          missingText="Trafik verileri eksik kalır."
        />
      </section>

      {/* Device compare */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <DeviceCompareCard
          label="Mobil Deneyim"
          icon={Smartphone}
          score={report?.mobile}
          active={strategy === "mobile"}
          onClick={() => setStrategy("mobile")}
        />
        <DeviceCompareCard
          label="Masaüstü Deneyim"
          icon={Monitor}
          score={report?.desktop}
          active={strategy === "desktop"}
          onClick={() => setStrategy("desktop")}
        />
      </section>

      {/* Fetch error banner */}
      {score?.fetchError && (
        <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-300">
              PageSpeed skoru şu an alınamadı
            </p>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              {score.fetchError}
            </p>
            <p className="text-xs text-amber-300 mt-3">
              Site tarayıcıda açılsa bile Google Lighthouse botu engelleniyor,
              yavaş yanıt alıyor veya SSL/yönlendirme sorununa takılıyor
              olabilir.
            </p>
          </div>
        </section>
      )}

      {/* Score insight cards */}
      <section className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-sm font-semibold text-zinc-200">
              PageSpeed Skorları
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Seçili cihaz: {strategy === "mobile" ? "Mobil" : "Masaüstü"} • Son
              ölçüm: {formatDate(score?.fetchedAt)}
            </p>
          </div>
          <div className="flex bg-white/[0.04] border border-white/[0.06] rounded-lg p-0.5">
            <button
              onClick={() => setStrategy("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${strategy === "mobile" ? "bg-white/[0.08] text-white" : "text-zinc-400"}`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Mobil
            </button>
            <button
              onClick={() => setStrategy("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${strategy === "desktop" ? "bg-white/[0.08] text-white" : "text-zinc-400"}`}
            >
              <Monitor className="w-3.5 h-3.5" /> Masaüstü
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <ScoreInsightCard
            icon={Zap}
            title="Performans"
            score={score?.performance}
            meaning="Sayfanın ne kadar hızlı açıldığını ve kullanıcıya ne kadar çabuk tepki verdiğini gösterir."
            healthy="Hız iyi. Kullanıcı siteye girince bekleme hissi düşük olur."
            warning="Site açılıyor ama görsel, yazılım veya sunucu tarafında hızlandırma yapılabilir."
            bad="Ziyaretçiler sayfa yüklenmeden çıkabilir. Görseller, cache ve sunucu yanıtı öncelikli incelenmeli."
          />
          <ScoreInsightCard
            icon={ShieldCheck}
            title="Erişilebilirlik"
            score={score?.accessibility}
            meaning="Buton, yazı, kontrast ve ekran okuyucu uyumluluğunun ne kadar sağlıklı olduğunu ölçer."
            healthy="Arayüz okunabilir ve erişilebilir durumda."
            warning="Bazı yazılar, kontrastlar veya alan etiketleri iyileştirilebilir."
            bad="Kullanıcıların bir kısmı siteyi kullanmakta zorlanabilir. Formlar, renkler ve etiketler kontrol edilmeli."
          />
          <ScoreInsightCard
            icon={BarChart3}
            title="Teknik Sağlık"
            score={score?.bestPractices}
            meaning="SSL, güvenli kaynaklar, tarayıcı uyumu ve temel teknik kaliteyi gösterir."
            healthy="Teknik temel iyi görünüyor."
            warning="Bazı tarayıcı/güvenlik uyarıları iyileştirilebilir."
            bad="Sitede güvenlik veya eski teknoloji kaynaklı problemler olabilir."
          />
          <ScoreInsightCard
            icon={Search}
            title="SEO"
            score={score?.seo}
            meaning="Google'ın sayfayı anlaması için başlık, açıklama, link ve taranabilirlik sinyallerini ölçer."
            healthy="Arama motorları sayfayı anlamakta zorlanmıyor."
            warning="Başlık, açıklama veya sayfa yapısı daha iyi hale getirilebilir."
            bad="Google görünürlüğü zarar görebilir. Meta alanları, indekslenebilirlik ve sayfa yapısı incelenmeli."
          />
        </div>
      </section>

      {/* Vital cards */}
      <section className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-5">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-4 h-4 text-[#F5BEC8]" />
          <div>
            <h2 className="text-sm font-semibold text-zinc-200">
              Kullanıcı Deneyimi Metrikleri
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Bu kartlar ziyaretçinin siteyi nasıl hissettiğini pratik dille
              anlatır.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <VitalCard
            metric="lcp"
            title="Ana İçerik Hızı"
            value={score?.lcpMs}
            formatted={formatMs(score?.lcpMs)}
            meaning="Sayfadaki ana görsel veya büyük içerik ne kadar sürede görünüyor?"
            good="Ana içerik hızlı geliyor."
            warning="İlk izlenim biraz yavaş olabilir."
            bad="Kullanıcı sayfa açılmadan beklemek zorunda kalır."
          />
          <VitalCard
            metric="fcp"
            title="İlk Görünme"
            value={score?.fcpMs}
            formatted={formatMs(score?.fcpMs)}
            meaning="Ekranda ilk yazı veya görselin görünme süresi."
            good="Sayfa hızlı tepki veriyor."
            warning="İlk görüntü gecikebilir."
            bad="Boş ekran hissi oluşabilir."
          />
          <VitalCard
            metric="tbt"
            title="Tıklama Gecikmesi"
            value={score?.tbtMs}
            formatted={formatMs(score?.tbtMs)}
            meaning="Sayfa açılırken tıklama ve kaydırmanın ne kadar bloklandığını gösterir."
            good="Etkileşim akıcı."
            warning="Bazı tıklamalar gecikmeli hissedilebilir."
            bad="Site donuyor gibi algılanabilir."
          />
          <VitalCard
            metric="cls"
            title="Sayfa Kayması"
            value={score?.clsValue}
            formatted={formatCls(score?.clsValue)}
            meaning="Sayfa açılırken buton ve yazıların yer değiştirip değiştirmediğini ölçer."
            good="Sayfa stabil, kayma az."
            warning="Bazı alanlar açılırken oynayabilir."
            bad="Kullanıcı yanlış yere tıklayabilir."
          />
          <VitalCard
            metric="fid"
            title="İlk Tepki"
            value={score?.fidMs}
            formatted={formatMs(score?.fidMs)}
            meaning="Kullanıcının ilk tıklamasına sitenin cevap verme süresi."
            good="İlk tepki hızlı."
            warning="İlk etkileşim biraz gecikebilir."
            bad="Kullanıcı tıkladığında site geç cevap verebilir."
          />
        </div>
      </section>
    </div>
  );
}
