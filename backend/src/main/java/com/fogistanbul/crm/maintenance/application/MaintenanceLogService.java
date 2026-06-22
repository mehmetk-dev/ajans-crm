package com.fogistanbul.crm.maintenance.application;

import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.maintenance.domain.MaintenanceLogEntry;
import com.fogistanbul.crm.maintenance.dto.MaintenanceLogRequest;
import com.fogistanbul.crm.maintenance.dto.MaintenanceLogResponse;
import com.fogistanbul.crm.maintenance.infrastructure.MaintenanceLogRepository;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MaintenanceLogService {

    private final MaintenanceLogRepository maintenanceLogRepository;
    private final CompanyRepository companyRepository;
    private final UserProfileRepository userProfileRepository;
    private final CompanyMembershipRepository membershipRepository;
    private final MaintenanceLogAccessPolicy accessPolicy;
    private final MaintenanceLogMapper mapper;

    @Transactional(readOnly = true)
    public List<MaintenanceLogResponse> listForCompany(UUID companyId, UUID userId) {
        UserProfile user = getUser(userId);
        accessPolicy.requireCompanyAccess(user, companyId);
        return maintenanceLogRepository.findByCompanyIdOrderByPerformedAtDesc(companyId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MaintenanceLogResponse> listForClient(UUID userId) {
        getUser(userId);
        List<UUID> companyIds = membershipRepository.findClientCompanyIdsForUser(userId);
        if (companyIds.isEmpty()) {
            return List.of();
        }
        return maintenanceLogRepository.findByCompanyIdInOrderByPerformedAtDesc(companyIds).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional
    public MaintenanceLogResponse create(UUID companyId, MaintenanceLogRequest request, UUID userId) {
        UserProfile author = getUser(userId);
        accessPolicy.requireManageAccess(author, companyId);
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Şirket bulunamadı"));

        MaintenanceLogEntry entry = MaintenanceLogEntry.builder()
                .company(company)
                .title(request.getTitle().trim())
                .description(normalizeDescription(request.getDescription()))
                .category(request.getCategory())
                .performedAt(request.getPerformedAt())
                .performedBy(author)
                .build();
        return mapper.toResponse(maintenanceLogRepository.save(entry));
    }

    @Transactional
    public MaintenanceLogResponse update(
            UUID companyId,
            UUID entryId,
            MaintenanceLogRequest request,
            UUID userId
    ) {
        UserProfile user = getUser(userId);
        accessPolicy.requireManageAccess(user, companyId);
        MaintenanceLogEntry entry = getEntry(entryId);
        accessPolicy.requireEntryCompany(entry, companyId);

        entry.setTitle(request.getTitle().trim());
        entry.setDescription(normalizeDescription(request.getDescription()));
        entry.setCategory(request.getCategory());
        entry.setPerformedAt(request.getPerformedAt());
        return mapper.toResponse(maintenanceLogRepository.save(entry));
    }

    @Transactional
    public void delete(UUID companyId, UUID entryId, UUID userId) {
        UserProfile user = getUser(userId);
        accessPolicy.requireManageAccess(user, companyId);
        MaintenanceLogEntry entry = getEntry(entryId);
        accessPolicy.requireEntryCompany(entry, companyId);
        maintenanceLogRepository.delete(entry);
    }

    private UserProfile getUser(UUID userId) {
        return userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
    }

    private MaintenanceLogEntry getEntry(UUID entryId) {
        return maintenanceLogRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Bakım kaydı bulunamadı"));
    }

    private String normalizeDescription(String description) {
        if (description == null || description.isBlank()) {
            return null;
        }
        return description.trim();
    }
}
