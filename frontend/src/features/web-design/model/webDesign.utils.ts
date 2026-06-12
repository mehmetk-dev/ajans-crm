import type { ElementType } from "react";
import { CheckCircle2, CircleAlert, Info, XCircle } from "lucide-react";
import type { HealthTone, PageSpeedScore } from "../webDesign.types";

export function normalizeInputUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://"))
    return trimmed;
  return `https://${trimmed}`;
}

export function scoreTone(score?: number | null): HealthTone {
  if (score == null) return "unknown";
  if (score >= 90) return "good";
  if (score >= 50) return "warning";
  return "bad";
}

export function metricTone(
  metric: "lcp" | "fcp" | "tbt" | "cls" | "fid",
  value?: number | null,
): HealthTone {
  if (value == null) return "unknown";
  if (metric === "cls") {
    if (value <= 0.1) return "good";
    if (value <= 0.25) return "warning";
    return "bad";
  }
  if (metric === "lcp") {
    if (value <= 2500) return "good";
    if (value <= 4000) return "warning";
    return "bad";
  }
  if (metric === "fcp") {
    if (value <= 1800) return "good";
    if (value <= 3000) return "warning";
    return "bad";
  }
  if (metric === "fid") {
    if (value <= 100) return "good";
    if (value <= 300) return "warning";
    return "bad";
  }
  // tbt
  if (value <= 200) return "good";
  if (value <= 600) return "warning";
  return "bad";
}

export function statusIcon(tone: HealthTone): ElementType {
  if (tone === "good") return CheckCircle2;
  if (tone === "warning") return CircleAlert;
  if (tone === "bad") return XCircle;
  return Info;
}

export function formatMs(ms?: number | null): string {
  if (ms == null) return "-";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} sn`;
}

export function formatCls(value?: number | null): string {
  if (value == null) return "-";
  return value.toFixed(3);
}

export function formatDate(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelative(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "Az önce";
  if (min < 60) return `${min} dk önce`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} sa önce`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days} gün önce`;
  return d.toLocaleDateString("tr-TR");
}

export function averageScore(score?: PageSpeedScore): number | null {
  if (!score) return null;
  const scores = [
    score.performance,
    score.accessibility,
    score.bestPractices,
    score.seo,
  ].filter((value): value is number => value != null);
  if (scores.length === 0) return null;
  return Math.round(
    scores.reduce((sum, value) => sum + value, 0) / scores.length,
  );
}

export function overallMessage(
  tone: HealthTone,
  strategy: "mobile" | "desktop",
): string {
  const device = strategy === "mobile" ? "mobilde" : "masaüstünde";
  if (tone === "good")
    return `Site ${device} iyi durumda. Ziyaretçi deneyimi ve Google sinyalleri sağlıklı görünüyor.`;
  if (tone === "warning")
    return `Site ${device} çalışıyor ama hız ve deneyim tarafında iyileştirme alanları var.`;
  if (tone === "bad")
    return `Site ${device} ziyaretçiyi kaybettirebilecek seviyede sorunlar gösteriyor. Öncelik hız ve stabilite olmalı.`;
  return "Google PageSpeed verisi henüz okunamadı. Bağlantı durumunu ve site erişimini kontrol edin.";
}

export function scoreColor(score?: number | null): string {
  if (score == null) return "text-zinc-500";
  if (score >= 90) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  return "text-red-400";
}

export function scoreRing(score?: number | null): string {
  if (score == null) return "stroke-zinc-700";
  if (score >= 90) return "stroke-emerald-400";
  if (score >= 50) return "stroke-amber-400";
  return "stroke-red-400";
}
