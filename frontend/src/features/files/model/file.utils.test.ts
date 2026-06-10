import { describe, it, expect } from "vitest";
import {
  formatFileSize,
  formatFileDate,
  isPreviewable,
  getFileIcon,
} from "./file.utils";
import { Image, Video, File } from "lucide-react";

describe("formatFileDate", () => {
  it("formats a date string", () => {
    const result = formatFileDate("2024-06-10T00:00:00Z");
    expect(result).toBeTruthy();
  });
  it("returns original string on invalid date", () => {
    expect(formatFileDate("invalid")).toBeDefined();
  });
});

describe("formatFileSize", () => {
  it("formats bytes", () => expect(formatFileSize(512)).toBe("512 B"));
  it("formats kilobytes", () => expect(formatFileSize(2048)).toBe("2.0 KB"));
  it("formats megabytes", () =>
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5.0 MB"));
});

describe("isPreviewable", () => {
  it("returns true for images", () =>
    expect(isPreviewable("image/jpeg")).toBe(true));
  it("returns true for videos", () =>
    expect(isPreviewable("video/mp4")).toBe(true));
  it("returns false for pdf", () =>
    expect(isPreviewable("application/pdf")).toBe(false));
  it("returns false for null", () => expect(isPreviewable(null)).toBe(false));
});

describe("getFileIcon", () => {
  it("returns Image icon for image type", () =>
    expect(getFileIcon("image/png")).toBe(Image));
  it("returns Video icon for video type", () =>
    expect(getFileIcon("video/mp4")).toBe(Video));
  it("returns File icon for null", () => expect(getFileIcon(null)).toBe(File));
});
