package com.fogistanbul.crm.instagram.application;

import com.fogistanbul.crm.entity.enums.ServiceCategory;
import com.fogistanbul.crm.instagram.oauth.application.InstagramOAuthService;
import com.fogistanbul.crm.repository.CompanyServiceRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class InstagramLoginWarmupService {

    private static final Logger log = LoggerFactory.getLogger(InstagramLoginWarmupService.class);

    private final CompanyServiceRepository companyServiceRepository;
    private final InstagramOAuthService instagramOAuthService;
    private final InstagramMediaSnapshotService mediaSnapshotService;
    private final Set<UUID> inFlight = ConcurrentHashMap.newKeySet();

    @Async
    public void warmUpCompany(UUID companyId) {
        if (companyId == null || !inFlight.add(companyId)) {
            return;
        }
        try {
            if (!isSocialMediaActive(companyId) || !instagramOAuthService.isConnected(companyId)) {
                return;
            }
            mediaSnapshotService.syncMediaSnapshotsNow(companyId, false);
        } catch (Exception exception) {
            log.warn("Instagram login warm-up failed, company={}: {}",
                    companyId, exception.getMessage());
        } finally {
            inFlight.remove(companyId);
        }
    }

    private boolean isSocialMediaActive(UUID companyId) {
        return companyServiceRepository
                .findByCompanyIdAndServiceCategory(companyId, ServiceCategory.SOCIAL_MEDIA)
                .map(com.fogistanbul.crm.entity.CompanyService::isActive)
                .orElse(false);
    }
}
