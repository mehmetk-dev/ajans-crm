package com.fogistanbul.crm.service;

import com.fogistanbul.crm.dto.AdminAnalyticsResponse;
import com.fogistanbul.crm.dto.AdminAnalyticsResponse.*;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.Task;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.CompanyKind;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.entity.enums.TaskStatus;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.TaskRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.TextStyle;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminAnalyticsService {

    private final CompanyRepository companyRepository;
    private final UserProfileRepository userProfileRepository;
    private final TaskRepository taskRepository;

    private static final String[] PALETTE = {
            "#3b82f6", "#f97316", "#10b981", "#8b5cf6", "#ec4899",
            "#06b6d4", "#eab308", "#ef4444", "#14b8a6", "#a855f7"
    };

    private static final String[] CATEGORY_COLORS = {
            "#3b82f6", "#f97316", "#10b981", "#8b5cf6", "#ec4899",
            "#06b6d4", "#eab308"
    };

    @Transactional(readOnly = true)
    public AdminAnalyticsResponse getAnalytics() {
        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.now(zone);

        long totalCompanies = companyRepository.countByKind(CompanyKind.CLIENT);
        long totalStaff = userProfileRepository.countByGlobalRole(GlobalRole.AGENCY_STAFF);

        List<Task> allTasks = taskRepository.findAll();
        long totalTasks = allTasks.size();
        long doneTasks = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();

        Instant monthStart = today.withDayOfMonth(1).atStartOfDay(zone).toInstant();
        Instant monthEnd = today.plusDays(1).atStartOfDay(zone).toInstant();
        List<Task> createdThisMonth = taskRepository.findCreatedInRange(monthStart, monthEnd);
        List<Task> completedThisMonth = taskRepository.findCompletedInRange(monthStart, monthEnd);
        long monthlyTasks = createdThisMonth.size();
        long monthlyCompleted = completedThisMonth.size();

        int completionRate = totalTasks > 0
                ? (int) Math.round((doneTasks * 100.0) / totalTasks) : 0;

        double avgCompletionDays = computeAvgCompletionDays(allTasks);

        int efficiency = computeEfficiency(createdThisMonth, completedThisMonth);

        List<MonthlyTaskStat> monthlyTrend = buildMonthlyTrend(today, zone);
        List<CompanyStat> companyPerformance = buildCompanyPerformance(allTasks);
        List<CategoryStat> taskDistribution = buildCategoryDistribution(allTasks);
        List<StaffStat> staffPerformance = buildStaffPerformance(allTasks);

        return AdminAnalyticsResponse.builder()
                .totalCompanies(totalCompanies)
                .totalStaff(totalStaff)
                .monthlyTasks(monthlyTasks)
                .monthlyCompleted(monthlyCompleted)
                .completionRate(completionRate)
                .avgCompletionDays(Math.round(avgCompletionDays * 10.0) / 10.0)
                .efficiency(efficiency)
                .monthlyTrend(monthlyTrend)
                .companyPerformance(companyPerformance)
                .taskDistribution(taskDistribution)
                .staffPerformance(staffPerformance)
                .build();
    }

    private double computeAvgCompletionDays(List<Task> tasks) {
        List<Long> durations = tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.DONE
                        && t.getCompletedAt() != null && t.getCreatedAt() != null)
                .map(t -> t.getCompletedAt().toEpochMilli() - t.getCreatedAt().toEpochMilli())
                .filter(d -> d > 0)
                .collect(Collectors.toList());
        if (durations.isEmpty()) return 0;
        double avgMillis = durations.stream().mapToLong(Long::longValue).average().orElse(0);
        return avgMillis / (double) Duration.ofDays(1).toMillis();
    }

    private int computeEfficiency(List<Task> created, List<Task> completed) {
        long createdCount = created.size();
        long completedCount = completed.size();
        if (createdCount == 0) return completedCount == 0 ? 0 : 100;
        int pct = (int) Math.round((completedCount * 100.0) / createdCount);
        return Math.min(pct, 100);
    }

    private List<MonthlyTaskStat> buildMonthlyTrend(LocalDate today, ZoneId zone) {
        Locale tr = new Locale("tr");
        List<MonthlyTaskStat> result = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            LocalDate m = today.minusMonths(i).withDayOfMonth(1);
            Instant mStart = m.atStartOfDay(zone).toInstant();
            Instant mEnd = m.with(TemporalAdjusters.lastDayOfMonth()).plusDays(1).atStartOfDay(zone).toInstant();
            long created = taskRepository.findCreatedInRange(mStart, mEnd).size();
            long completed = taskRepository.findCompletedInRange(mStart, mEnd).size();
            String name = m.getMonth().getDisplayName(TextStyle.SHORT, tr);
            result.add(MonthlyTaskStat.builder()
                    .name(name)
                    .görevler(created)
                    .tamamlanan(completed)
                    .build());
        }
        return result;
    }

    private List<CompanyStat> buildCompanyPerformance(List<Task> tasks) {
        Map<String, long[]> byCompany = new LinkedHashMap<>();
        for (Task t : tasks) {
            String name = t.getCompany() != null ? t.getCompany().getName() : "Ajans İçi";
            long[] arr = byCompany.computeIfAbsent(name, k -> new long[2]);
            arr[0]++;
            if (t.getStatus() == TaskStatus.DONE) arr[1]++;
        }
        return byCompany.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue()[0], a.getValue()[0]))
                .limit(6)
                .map(e -> CompanyStat.builder()
                        .name(e.getKey())
                        .görevler(e.getValue()[0])
                        .tamamlanan(e.getValue()[1])
                        .build())
                .collect(Collectors.toList());
    }

    private List<CategoryStat> buildCategoryDistribution(List<Task> tasks) {
        Map<String, Long> byCategory = new LinkedHashMap<>();
        for (Task t : tasks) {
            String name = t.getCategory() != null ? t.getCategory().name() : "OTHER";
            byCategory.merge(name, 1L, Long::sum);
        }
        if (byCategory.isEmpty()) {
            byCategory.put("OTHER", 0L);
        }
        int idx = 0;
        List<CategoryStat> result = new ArrayList<>();
        for (Map.Entry<String, Long> e : byCategory.entrySet()) {
            result.add(CategoryStat.builder()
                    .name(e.getKey())
                    .value(e.getValue())
                    .color(CATEGORY_COLORS[idx % CATEGORY_COLORS.length])
                    .build());
            idx++;
        }
        return result;
    }

    private List<StaffStat> buildStaffPerformance(List<Task> tasks) {
        Map<UUID, long[]> byStaff = new LinkedHashMap<>();
        Map<UUID, String> staffNames = new HashMap<>();
        for (Task t : tasks) {
            UserProfile assignee = t.getAssignedTo();
            if (assignee == null) continue;
            if (assignee.getGlobalRole() != GlobalRole.AGENCY_STAFF) continue;
            long[] arr = byStaff.computeIfAbsent(assignee.getId(), k -> new long[2]);
            arr[0]++;
            if (t.getStatus() == TaskStatus.DONE) arr[1]++;
            String name = assignee.getPerson() != null ? assignee.getPerson().getFullName() : assignee.getEmail();
            staffNames.putIfAbsent(assignee.getId(), name);
        }
        int idx = 0;
        List<StaffStat> result = new ArrayList<>();
        for (Map.Entry<UUID, long[]> e : byStaff.entrySet()) {
            long max = e.getValue()[0];
            long done = e.getValue()[1];
            result.add(StaffStat.builder()
                    .label(staffNames.getOrDefault(e.getKey(), "Bilinmiyor"))
                    .value(done)
                    .max(max)
                    .color(PALETTE[idx % PALETTE.length])
                    .build());
            idx++;
        }
        result.sort((a, b) -> Long.compare(b.getValue(), a.getValue()));
        return result;
    }
}
