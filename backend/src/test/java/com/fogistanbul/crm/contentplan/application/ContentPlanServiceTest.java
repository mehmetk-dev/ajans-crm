package com.fogistanbul.crm.contentplan.application;

import com.fogistanbul.crm.contentplan.dto.UpdateContentPlanRequest;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.ContentPlan;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.ContentStatus;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.ContentPlanRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.service.NotificationService;
import com.fogistanbul.crm.shoot.application.ShootService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ContentPlanServiceTest {

    @Mock
    private ContentPlanRepository contentPlanRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private UserProfileRepository userProfileRepository;
    @Mock
    private CompanyMembershipRepository membershipRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private ShootService shootService;
    @Mock
    private ContentPlanAccessPolicy accessPolicy;
    @Mock
    private ContentPlanWorkflowPolicy workflowPolicy;
    @Mock
    private ContentPlanMapper mapper;

    @InjectMocks
    private ContentPlanService contentPlanService;

    @Test
    void updateDelegatesStatusValidationToWorkflowPolicy() {
        UUID planId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        ContentPlan plan = ContentPlan.builder()
                .id(planId)
                .company(Company.builder().id(UUID.randomUUID()).build())
                .status(ContentStatus.DRAFT)
                .build();
        UserProfile user = UserProfile.builder().id(userId).build();
        when(contentPlanRepository.findById(planId)).thenReturn(Optional.of(plan));
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(user));
        when(contentPlanRepository.save(plan)).thenReturn(plan);
        UpdateContentPlanRequest request = new UpdateContentPlanRequest();
        request.setStatus(ContentStatus.WAITING_APPROVAL);

        contentPlanService.update(planId, request, userId);

        verify(workflowPolicy).requireStatusChange(plan, ContentStatus.WAITING_APPROVAL);
    }
}
