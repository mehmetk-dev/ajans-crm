package com.fogistanbul.crm.contentplan.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fogistanbul.crm.contentplan.dto.CreateApprovalRequest;
import com.fogistanbul.crm.entity.ApprovalRequest;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.ContentPlan;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.ContentStatus;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.entity.enums.NotificationType;
import com.fogistanbul.crm.entity.enums.RequestStatus;
import com.fogistanbul.crm.entity.enums.RequestType;
import com.fogistanbul.crm.repository.ApprovalRequestRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
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
    @Mock
    private NotificationService notificationService;

    private ApprovalRequestService requestService;

    @BeforeEach
    void setUp() {
        requestService = new ApprovalRequestService(
                approvalRequestRepository,
                companyRepository,
                userProfileRepository,
                contentPlanService,
                approvalService,
                accessPolicy,
                metadataCodec,
                mapper,
                notificationService,
                new ObjectMapper());
    }

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

    @Test
    void generalRequestNotifiesEveryAdminAfterItIsSaved() {
        UUID requesterId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        UUID requestId = UUID.randomUUID();
        UUID firstAdminId = UUID.randomUUID();
        UUID secondAdminId = UUID.randomUUID();
        UserProfile requester = UserProfile.builder().id(requesterId).email("owner@example.com").build();
        Company company = Company.builder().id(companyId).name("Örnek Şirket").build();
        UserProfile firstAdmin = UserProfile.builder().id(firstAdminId).globalRole(GlobalRole.ADMIN).build();
        UserProfile secondAdmin = UserProfile.builder().id(secondAdminId).globalRole(GlobalRole.ADMIN).build();
        CreateApprovalRequest request = new CreateApprovalRequest();
        request.setType(RequestType.GENERAL);
        request.setCompanyId(companyId);
        request.setTitle("Ek Hizmet Talebi");
        request.setDescription("Yeni kampanya için önceliklidir.");
        request.setMetadata("{\"kind\":\"ADDITIONAL_SERVICE\",\"services\":[{\"id\":\"SOCIAL_MEDIA\",\"name\":\"Sosyal Medya\"}]}");

        when(userProfileRepository.findById(requesterId)).thenReturn(Optional.of(requester));
        when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));
        when(approvalRequestRepository.save(any(ApprovalRequest.class))).thenAnswer(invocation -> {
            ApprovalRequest saved = invocation.getArgument(0);
            saved.setId(requestId);
            return saved;
        });
        when(userProfileRepository.findByGlobalRole(GlobalRole.ADMIN))
                .thenReturn(List.of(firstAdmin, secondAdmin));

        requestService.create(request, requesterId);

        verify(accessPolicy).requireOwner(requesterId, companyId);

        verify(notificationService).send(
                eq(firstAdminId), eq(NotificationType.APPROVAL_REQUEST),
                eq("Yeni ek hizmet talebi"), eq("Örnek Şirket ek hizmet talebi oluşturdu."),
                eq("APPROVAL_REQUEST"), eq(requestId));
        verify(notificationService).send(
                eq(secondAdminId), eq(NotificationType.APPROVAL_REQUEST),
                eq("Yeni ek hizmet talebi"), eq("Örnek Şirket ek hizmet talebi oluşturdu."),
                eq("APPROVAL_REQUEST"), eq(requestId));
    }

    @Test
    void ordinaryGeneralRequestDoesNotRequireOwnerAccess() {
        UUID requesterId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        UserProfile requester = UserProfile.builder().id(requesterId).build();
        Company company = Company.builder().id(companyId).name("Örnek Şirket").build();
        CreateApprovalRequest request = new CreateApprovalRequest();
        request.setType(RequestType.GENERAL);
        request.setCompanyId(companyId);
        request.setTitle("Genel İstek");

        when(userProfileRepository.findById(requesterId)).thenReturn(Optional.of(requester));
        when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));
        when(approvalRequestRepository.save(any(ApprovalRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        requestService.create(request, requesterId);

        verify(accessPolicy, never()).requireOwner(requesterId, companyId);
    }

    @Test
    void listAdditionalServiceRequestsRequiresOwnerAndReturnsOnlyServiceRequests() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        ApprovalRequest serviceRequest = ApprovalRequest.builder()
                .title("Ek Hizmet Talebi")
                .build();
        ApprovalRequest ordinaryRequest = ApprovalRequest.builder()
                .title("Genel İstek")
                .build();

        when(approvalRequestRepository.findByCompanyIdInOrderByCreatedAtDesc(List.of(companyId)))
                .thenReturn(List.of(serviceRequest, ordinaryRequest));
        when(mapper.toResponse(serviceRequest)).thenReturn(
                com.fogistanbul.crm.contentplan.dto.ApprovalRequestResponse.builder()
                        .title("Ek Hizmet Talebi")
                        .build());

        List<com.fogistanbul.crm.contentplan.dto.ApprovalRequestResponse> result =
                requestService.getAdditionalServiceRequests(userId, companyId);

        verify(accessPolicy).requireOwner(userId, companyId);
        org.junit.jupiter.api.Assertions.assertEquals(1, result.size());
        org.junit.jupiter.api.Assertions.assertEquals("Ek Hizmet Talebi", result.get(0).getTitle());
    }

    @Test
    void duplicatePendingAdditionalServiceIsRejected() {
        UUID requesterId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        UserProfile requester = UserProfile.builder().id(requesterId).build();
        Company company = Company.builder().id(companyId).name("Örnek Şirket").build();
        CreateApprovalRequest request = new CreateApprovalRequest();
        request.setType(RequestType.GENERAL);
        request.setCompanyId(companyId);
        request.setTitle("Ek Hizmet Talebi");
        request.setMetadata("{\"kind\":\"ADDITIONAL_SERVICE\",\"services\":[{\"id\":\"SOCIAL_MEDIA\",\"name\":\"Sosyal Medya\"}]}");
        ApprovalRequest existing = ApprovalRequest.builder()
                .type(RequestType.GENERAL)
                .status(RequestStatus.PENDING)
                .title("Ek Hizmet Talebi")
                .metadata("{\"kind\":\"ADDITIONAL_SERVICE\",\"services\":[{\"id\":\"SOCIAL_MEDIA\",\"name\":\"Sosyal Medya\"}]}")
                .build();

        when(userProfileRepository.findById(requesterId)).thenReturn(Optional.of(requester));
        when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));
        when(approvalRequestRepository.findByCompanyIdAndStatusOrderByCreatedAtDesc(
                companyId, RequestStatus.PENDING)).thenReturn(List.of(existing));

        assertThrows(IllegalStateException.class, () -> requestService.create(request, requesterId));
    }
}
