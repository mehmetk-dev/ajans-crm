package com.fogistanbul.crm.contentplan.application;

import com.fogistanbul.crm.contentplan.dto.CreateApprovalRequest;
import com.fogistanbul.crm.entity.ApprovalRequest;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.ContentPlan;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.ContentStatus;
import com.fogistanbul.crm.entity.enums.RequestStatus;
import com.fogistanbul.crm.entity.enums.RequestType;
import com.fogistanbul.crm.repository.ApprovalRequestRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ApprovalRequestServiceTest {

    @Mock
    private ApprovalRequestRepository approvalRequestRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private UserProfileRepository userProfileRepository;
    @Mock
    private ContentPlanService contentPlanService;
    @Mock
    private ContentPlanApprovalService approvalService;
    @Mock
    private ContentPlanAccessPolicy accessPolicy;
    @Mock
    private ContentApprovalMetadata metadataCodec;
    @Mock
    private ApprovalRequestMapper mapper;

    @InjectMocks
    private ApprovalRequestService requestService;

    @Test
    void duplicatePendingContentApprovalIsRejected() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        UUID planId = UUID.randomUUID();
        CreateApprovalRequest request = new CreateApprovalRequest();
        request.setType(RequestType.CONTENT_APPROVAL);
        request.setReferenceId(planId);
        request.setCompanyId(companyId);
        request.setTitle("Icerik onayi");

        when(userProfileRepository.findById(userId))
                .thenReturn(Optional.of(UserProfile.builder().id(userId).build()));
        when(companyRepository.findById(companyId))
                .thenReturn(Optional.of(Company.builder().id(companyId).build()));
        when(contentPlanService.getPlanForApproval(planId, companyId, userId, false))
                .thenReturn(ContentPlan.builder()
                        .company(Company.builder().id(companyId).build())
                        .status(ContentStatus.WAITING_APPROVAL)
                        .build());
        when(approvalRequestRepository.findByReferenceIdAndTypeAndStatus(
                planId, RequestType.CONTENT_APPROVAL, RequestStatus.PENDING))
                .thenReturn(Optional.of(ApprovalRequest.builder().id(UUID.randomUUID()).build()));

        assertThrows(IllegalStateException.class, () ->
                requestService.create(request, userId));
    }
}
