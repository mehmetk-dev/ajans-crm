package com.fogistanbul.crm.googleanalytics.application;

import com.fogistanbul.crm.googleanalytics.dto.GaOverviewResponse.GaDailyRow;
import com.fogistanbul.crm.googleanalytics.dto.GaOverviewResponse.GaNamedMetric;
import com.google.analytics.data.v1beta.Row;
import org.springframework.stereotype.Component;

/**
 * Google Analytics API satırlarını modül DTO'larına dönüştürür.
 * İş mantığından bağımsız saf veri dönüşüm işlemleri burada toplanır.
 */
@Component
public class GoogleAnalyticsMapper {

    /**
     * GA API satırından günlük trend kaydı oluşturur.
     * @param row GA API'den gelen satır (dimension[0]=date, metric[0]=sessions, metric[1]=users)
     */
    public GaDailyRow toDailyRow(Row row) {
        return new GaDailyRow(
                formatDate(row.getDimensionValues(0).getValue()),
                parseLong(row, 0),
                parseLong(row, 1)
        );
    }

    /**
     * GA API satırından isimli metrik oluşturur.
     * @param row GA API'den gelen satır (dimension[0]=name, metric[0]=value)
     */
    public GaNamedMetric toNamedMetric(Row row) {
        return new GaNamedMetric(
                row.getDimensionValues(0).getValue(),
                parseLong(row, 0)
        );
    }

    // ─── Yardımcılar ─────────────────────────────────────────────────────────

    /** YYYYMMDD → DD.MM */
    public String formatDate(String yyyymmdd) {
        if (yyyymmdd == null || yyyymmdd.length() != 8) return yyyymmdd;
        return yyyymmdd.substring(6) + "." + yyyymmdd.substring(4, 6);
    }

    public long parseLong(Row row, int idx) {
        try {
            return Long.parseLong(row.getMetricValues(idx).getValue());
        } catch (NumberFormatException e) {
            return 0L;
        }
    }

    public double parseDouble(Row row, int idx) {
        try {
            return Double.parseDouble(row.getMetricValues(idx).getValue());
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }
}
