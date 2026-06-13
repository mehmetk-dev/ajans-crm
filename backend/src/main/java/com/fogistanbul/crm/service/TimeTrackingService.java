package com.fogistanbul.crm.service;

import com.fogistanbul.crm.dto.StartTimerRequest;
import com.fogistanbul.crm.dto.TimeEntryResponse;
import com.fogistanbul.crm.entity.Task;
import com.fogistanbul.crm.entity.TimeEntry;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.exception.ApiException;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.TaskRepository;
import com.fogistanbul.crm.repository.TimeEntryRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TimeTrackingService {

    private final TimeEntryRepository timeEntryRepository;
    private final TaskRepository taskRepository;
    private final UserProfileRepository userProfileRepository;
    private final CompanyMembershipRepository membershipRepository;

    @Transactional
    public TimeEntryResponse startTimer(StartTimerRequest request, UUID userId) {
        // Stop any existing running timer
        timeEntryRepository.findByUserIdAndIsRunningTrue(userId).ifPresent(running -> {
            running.setIsRunning(false);
            running.setEndedAt(Instant.now());
            running.setDurationMinutes((int) Duration.between(running.getStartedAt(), running.getEndedAt()).toMinutes());
            timeEntryRepository.save(running);
        });

        UserProfile user = userProfileRepository.findById(userId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "USER_NOT_FOUND",
                        "Kullanıcı bulunamadı"
                ));

        Task task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "TASK_NOT_FOUND",
                        "Görev bulunamadı"
                ));
        if (task.getCompany() != null) {
            ensureCompanyAccess(user, task.getCompany().getId());
        }

        TimeEntry entry = TimeEntry.builder()
                .user(user)
                .task(task)
                .company(task.getCompany())
                .description(request.getDescription())
                .startedAt(Instant.now())
                .isRunning(true)
                .build();

        entry = timeEntryRepository.save(entry);
        log.info("Timer started for task {} by user {}", task.getTitle(), userId);
        return toResponse(entry);
    }

    @Transactional
    public TimeEntryResponse stopTimer(UUID userId) {
        TimeEntry entry = timeEntryRepository.findByUserIdAndIsRunningTrue(userId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "RUNNING_TIMER_NOT_FOUND",
                        "Çalışan zamanlayıcı bulunamadı"
                ));

        entry.setIsRunning(false);
        entry.setEndedAt(Instant.now());
        entry.setDurationMinutes((int) Duration.between(entry.getStartedAt(), entry.getEndedAt()).toMinutes());

        entry = timeEntryRepository.save(entry);
        log.info("Timer stopped for user {}: {} minutes", userId, entry.getDurationMinutes());
        return toResponse(entry);
    }

    @Transactional(readOnly = true)
    public TimeEntryResponse getRunningTimer(UUID userId) {
        return timeEntryRepository.findByUserIdAndIsRunningTrue(userId)
                .map(this::toResponse)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public Page<TimeEntryResponse> getMyEntries(UUID userId, Pageable pageable) {
        return timeEntryRepository.findByUserIdOrderByStartedAtDesc(userId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<TimeEntryResponse> getEntriesByDateRange(UUID userId, Instant from, Instant to) {
        return timeEntryRepository.findByUserIdAndDateRange(userId, from, to)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public int getTotalMinutes(UUID userId, Instant from, Instant to) {
        return timeEntryRepository.sumDurationByUserAndDateRange(userId, from, to);
    }

    @Transactional
    public void deleteEntry(UUID entryId, UUID userId) {
        TimeEntry entry = timeEntryRepository.findById(entryId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "TIME_ENTRY_NOT_FOUND",
                        "Zaman kaydı bulunamadı"
                ));
        if (!entry.getUser().getId().equals(userId)) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "TIME_ENTRY_DELETE_FORBIDDEN",
                    "Bu zaman kaydını silme yetkiniz yok"
            );
        }
        timeEntryRepository.delete(entry);
    }

    private TimeEntryResponse toResponse(TimeEntry e) {
        return TimeEntryResponse.builder()
                .id(e.getId())
                .userId(e.getUser().getId())
                .userName(e.getUser().getPerson() != null
                        ? e.getUser().getPerson().getFullName()
                        : e.getUser().getEmail())
                .taskId(e.getTask() != null ? e.getTask().getId() : null)
                .taskTitle(e.getTask() != null ? e.getTask().getTitle() : null)
                .companyId(e.getCompany() != null ? e.getCompany().getId() : null)
                .companyName(e.getCompany() != null ? e.getCompany().getName() : null)
                .description(e.getDescription())
                .startedAt(e.getStartedAt())
                .endedAt(e.getEndedAt())
                .durationMinutes(e.getDurationMinutes())
                .isRunning(Boolean.TRUE.equals(e.getIsRunning()))
                .createdAt(e.getCreatedAt())
                .build();
    }

    private void ensureCompanyAccess(UserProfile user, UUID companyId) {
        if (user.getGlobalRole() == GlobalRole.ADMIN) {
            return;
        }
        if (!membershipRepository.existsByUserIdAndCompanyId(user.getId(), companyId)) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "TIME_TRACKING_FORBIDDEN",
                    "Bu görev için zaman takibi yetkiniz yok"
            );
        }
    }
}
