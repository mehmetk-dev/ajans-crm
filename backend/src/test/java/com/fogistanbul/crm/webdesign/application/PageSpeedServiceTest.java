package com.fogistanbul.crm.webdesign.application;

import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.googleoauth.application.GoogleOAuthService;
import com.fogistanbul.crm.webdesign.PageSpeedSnapshotRepository;
import com.fogistanbul.crm.webdesign.domain.PageSpeedSnapshot;
import com.fogistanbul.crm.webdesign.dto.PageSpeedReportResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PageSpeedServiceTest {

    @Mock
    CompanyRepository companyRepository;

    @Mock
    PageSpeedSnapshotRepository snapshotRepository;

    @Mock
    GoogleOAuthService googleOAuthService;

    @Mock
    PageSpeedMapper mapper;

    @InjectMocks
    PageSpeedService service;

    @Test
    void getReport_companyWithNoWebsite_returnsNotConfigured() {
        UUID companyId = UUID.randomUUID();
        Company company = new Company();
        company.setId(companyId);
        company.setWebsite(null);

        when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));
        when(googleOAuthService.getSiteUrl(companyId)).thenReturn(Optional.empty());
        when(googleOAuthService.isConnected(any(), any())).thenReturn(false);
        when(googleOAuthService.getPropertyId(any())).thenReturn(Optional.empty());

        PageSpeedSnapshot dummySnap = new PageSpeedSnapshot();
        dummySnap.setStrategy("mobile");
        dummySnap.setTestedUrl("");
        dummySnap.setFetchedAt(Instant.now());
        when(snapshotRepository.findByCompanyIdAndStrategy(any(), any())).thenReturn(Optional.empty());
        when(snapshotRepository.save(any())).thenReturn(dummySnap);
        when(mapper.toScoreResponse(any())).thenReturn(null);

        PageSpeedReportResponse result = service.getReport(companyId, false);

        assertThat(result.isConfigured()).isFalse();
    }

    @Test
    void updateWebsite_emptyUrl_throwsRuntimeException() {
        UUID companyId = UUID.randomUUID();
        assertThatThrownBy(() -> service.updateWebsite(companyId, ""))
                .isInstanceOf(com.fogistanbul.crm.exception.ApiException.class)
                .hasMessageContaining("boş olamaz");
    }
}
