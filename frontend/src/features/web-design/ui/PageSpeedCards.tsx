/* eslint-disable react-hooks/static-components */
import type { ElementType } from "react";
import {
  BarChart3,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  Globe2,
  Monitor,
  Search,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  Zap,
} from "lucide-react";
import type {
  HealthTone,
  PageSpeedScore,
  PageSpeedReport,
  Strategy,
} from "../webDesign.types";
import { toneStyles } from "../webDesign.types";
import {
  averageScore,
  metricTone,
  overallMessage,
  scoreTone,
  statusIcon,
} from "../model/webDesign.utils";

// Suppress unused import warnings for icons used only in JSX type positions
void BarChart3;
void ExternalLink;
void Globe2;
void Monitor;
void Search;
void ShieldCheck;
void Smartphone;
void TrendingUp;
void Zap;

// HealthSummary
export function HealthSummary({
  score,
  strategy,
}: {
  score?: PageSpeedScore;
  strategy: Strategy;
}) {
  const average = averageScore(score);
  const tone = score?.fetchError ? "bad" : scoreTone(average);
  const style = toneStyles[tone];
  const Icon = statusIcon(tone);

  return (
    <section
      className={`rounded-2xl border ${style.border} ${style.softBg} p-5 md:p-6`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={`h-12 w-12 rounded-xl ${style.iconBg} flex items-center justify-center shrink-0`}
          >
            <Icon className={`w-6 h-6 ${style.text}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-white">
                Genel Site Sağlığı
              </h2>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${style.bg} ${style.text} border ${style.border}`}
              >
                {style.label}
              </span>
            </div>
            <p className="text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
              {overallMessage(tone, strategy)}
            </p>
          </div>
        </div>

        <div className="flex items-end gap-3">
          <div className="text-right">
            <p className="text-[11px] text-zinc-500 uppercase tracking-wider">
              Ortalama Skor
            </p>
            <p className={`text-5xl font-bold leading-none ${style.text}`}>
              {average ?? "-"}
            </p>
          </div>
          <p className="text-zinc-600 text-sm pb-1">/ 100</p>
        </div>
      </div>
    </section>
  );
}

// DeviceCompareCard
export function DeviceCompareCard({
  label,
  icon: Icon,
  score,
  active,
  onClick,
}: {
  label: string;
  icon: ElementType;
  score?: PageSpeedScore;
  active: boolean;
  onClick: () => void;
}) {
  const avg = averageScore(score);
  const tone = score?.fetchError ? "bad" : scoreTone(avg);
  const style = toneStyles[tone];

  return (
    <button
      onClick={onClick}
      className={`text-left rounded-2xl border p-4 transition-all ${
        active
          ? `${style.border} ${style.softBg}`
          : "border-white/[0.06] bg-[#0C0C0E] hover:border-white/[0.12]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-xl ${style.iconBg} flex items-center justify-center`}
          >
            <Icon className={`w-5 h-5 ${style.text}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{label}</p>
            <p className={`text-[11px] ${style.text}`}>{style.label}</p>
          </div>
        </div>
        <p className={`text-2xl font-bold ${style.text}`}>{avg ?? "-"}</p>
      </div>
    </button>
  );
}

// ConnectionCard
export function ConnectionCard({
  active,
  label,
  value,
  icon: Icon,
  healthyText,
  missingText,
}: {
  active: boolean;
  label: string;
  value: string;
  icon: ElementType;
  healthyText: string;
  missingText: string;
}) {
  const tone: HealthTone = active ? "good" : "warning";
  const style = toneStyles[tone];
  const StatusIcon = statusIcon(tone);

  return (
    <div
      className={`rounded-2xl border ${style.border} ${style.softBg} p-4 min-w-0`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`h-10 w-10 rounded-xl ${style.iconBg} flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-5 h-5 ${style.text}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-white">{label}</p>
            <StatusIcon className={`w-4 h-4 ${style.text} shrink-0`} />
          </div>
          <p className="text-xs text-zinc-500 truncate mt-1" title={value}>
            {value}
          </p>
          <p className={`text-[11px] mt-3 ${style.text}`}>
            {active ? healthyText : missingText}
          </p>
        </div>
      </div>
    </div>
  );
}

// ScoreInsightCard
export function ScoreInsightCard({
  icon: Icon,
  title,
  score,
  meaning,
  healthy,
  warning,
  bad,
}: {
  icon: ElementType;
  title: string;
  score?: number | null;
  meaning: string;
  healthy: string;
  warning: string;
  bad: string;
}) {
  const tone = scoreTone(score);
  const style = toneStyles[tone];
  const StatusIcon = statusIcon(tone);
  const action =
    tone === "good"
      ? healthy
      : tone === "warning"
        ? warning
        : tone === "bad"
          ? bad
          : "Skor alındığında durum burada görünecek.";

  return (
    <div className={`rounded-2xl border ${style.border} bg-[#0C0C0E] p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div
          className={`h-11 w-11 rounded-xl ${style.iconBg} flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${style.text}`} />
        </div>
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-4 h-4 ${style.text}`} />
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider ${style.text}`}
          >
            {style.label}
          </span>
        </div>
      </div>
      <div className="mt-5 flex items-end gap-2">
        <p className={`text-4xl font-bold leading-none ${style.text}`}>
          {score ?? "-"}
        </p>
        <p className="text-sm text-zinc-600 pb-1">/ 100</p>
      </div>
      <h3 className="text-sm font-semibold text-white mt-4">{title}</h3>
      <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{meaning}</p>
      <div
        className={`mt-4 rounded-xl ${style.softBg} border ${style.border} p-3`}
      >
        <p className={`text-xs leading-relaxed ${style.text}`}>{action}</p>
      </div>
    </div>
  );
}

// VitalCard
export function VitalCard({
  metric,
  title,
  value,
  formatted,
  meaning,
  good,
  warning,
  bad,
}: {
  metric: "lcp" | "fcp" | "tbt" | "cls" | "fid";
  title: string;
  value?: number | null;
  formatted: string;
  meaning: string;
  good: string;
  warning: string;
  bad: string;
}) {
  const tone = metricTone(metric, value);
  const style = toneStyles[tone];
  const StatusIcon = statusIcon(tone);
  const summary =
    tone === "good"
      ? good
      : tone === "warning"
        ? warning
        : tone === "bad"
          ? bad
          : "Bu metrik henüz ölçülemedi.";

  return (
    <div className={`rounded-2xl border ${style.border} bg-[#0C0C0E] p-4`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">{title}</p>
        <StatusIcon className={`w-4 h-4 ${style.text}`} />
      </div>
      <p className={`text-2xl font-bold mt-3 ${style.text}`}>{formatted}</p>
      <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
        {meaning}
      </p>
      <p className={`text-[11px] mt-3 leading-relaxed ${style.text}`}>
        {summary}
      </p>
    </div>
  );
}

// ReadinessRow
export function ReadinessRow({
  done,
  label,
  detail,
}: {
  done: boolean;
  label: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/[0.04] last:border-b-0">
      <div
        className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 ${
          done ? "bg-emerald-500/10" : "bg-amber-500/10"
        }`}
      >
        {done ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <CircleAlert className="w-3.5 h-3.5 text-amber-400" />
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{detail}</p>
      </div>
    </div>
  );
}

// Re-export PageSpeedReport type so consumers don't have to import separately
export type { PageSpeedReport };
