package com.fogistanbul.crm.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AdminAnalyticsResponse {

    private long totalCompanies;
    private long totalStaff;
    private long monthlyTasks;
    private long monthlyCompleted;
    private int completionRate;
    private double avgCompletionDays;
    private int efficiency;

    private List<MonthlyTaskStat> monthlyTrend;
    private List<CompanyStat> companyPerformance;
    private List<CategoryStat> taskDistribution;
    private List<StaffStat> staffPerformance;

    @Data @Builder
    public static class MonthlyTaskStat {
        private String name;
        private long görevler;
        private long tamamlanan;
    }

    @Data @Builder
    public static class CompanyStat {
        private String name;
        private long görevler;
        private long tamamlanan;
    }

    @Data @Builder
    public static class CategoryStat {
        private String name;
        private long value;
        private String color;
    }

    @Data @Builder
    public static class StaffStat {
        private String label;
        private long value;
        private long max;
        private String color;
    }
}
