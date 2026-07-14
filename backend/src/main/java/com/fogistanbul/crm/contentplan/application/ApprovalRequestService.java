package com.fogistanbul.crm.contentplan.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fogistanbul.crm.contentplan.dto.ApprovalRequestResponse;
import com.fogistanbul.crm.contentplan.dto.CreateApprovalRequest;
import com.fogistanbul.crm.contentplan.dto.ReviewApprovalRequest;
import com.fogistanbul.crm.entity.ApprovalRequest;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.ContentPlan;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.entity.enums.NotificationType;
import com.fogistanbul.crm.entity.enums.RequestStatus;
import com.fogistanbul.crm.entity.enums.RequestType;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import com.fogistanbul.crm.repository.ApprovalRequestRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApprovalRequestService {

    private static final String ADDITIONAL_SERVICE_TITLE = "Ek Hizmet Talebi";

    private final ApprovalRequestRepository approvalRequestRepository;
    private final CompanyRepository companyRepository;
    private final UserProfileRepository userProfileRepository;
    private final ContentPlanService contentPlanService;
    private final ContentPlanApprovalService approvalService;
    private final ContentPlanAccessPolicy accessPolicy;
    private final ContentApprovalMetadata metadataCodec;
    private final ApprovalRequestMapper mapper;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @Transactional
    public ApprovalRequestResponse create(CreateApprovalRequest request, UUID userId) {
        UserProfile requester = getUserOrThrow(userId);
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Şirket bulunamadı"));
        accessPolicy.requireCompanyAccess(requester, company.getId());

        if (isAdditionalServiceRequest(request)) {
            accessPolicy.requireOwner(userId, company.getId());
            validateAdditionalServiceRequest(request, company.getId());
        }

        if (request.getType() == RequestType.CONTENT_APPROVAL) {
            validateContentApproval(request, userId);
        }

        ApprovalRequest saved = approvalRequestRepository.save(ApprovalRequest.builder()
                .type(request.getType())
                .referenceId(request.getReferenceId())
                .company(company)
                .requestedBy(requester)
                .status(RequestStatus.PENDING)
                .title(request.getTitle())
                .description(request.getDescription())
                .metadata(request.getMetadata())
                .build());
        notifyAdmins(saved);
        return mapper.toResponse(saved);
    }

    private void notifyAdmins(ApprovalRequest request) {
        if (request.getType() != RequestType.GENERAL) return;

        boolean isAdditionalServiceRequest = ADDITIONAL_SERVICE_TITLE.equals(request.getTitle());
        String title = isAdditionalServiceRequest ? "Yeni ek hizmet talebi" : "Yeni genel istek";
        String message = isAdditionalServiceRequest
                ? request.getCompany().getName() + " ek hizmet talebi oluşturdu."
                : request.getCompany().getName() + " yeni bir istek oluşturdu.";
        userProfileRepository.findByGlobalRole(GlobalRole.ADMIN).forEach(admin ->
                notificationService.send(
                        admin.getId(), NotificationType.APPROVAL_REQUEST,
                        title, message, "APPROVAL_REQUEST", request.getId()));
    }

    @Transactional(readOnly = true)
    public List<ApprovalRequestResponse> getAll(UUID userId) {
        UserProfile user = getUserOrThrow(userId);
        List<ApprovalRequest> requests;
        if (user.getGlobalRole() == GlobalRole.ADMIN) {
            requests = approvalRequestRepository.findAllByOrderByCreatedAtDesc();
        } else {
            List<UUID> companyIds = accessPolicy.accessibleCompanyIds(user);
            requests = companyIds.isEmpty()
                    ? List.of()
                    : approvalRequestRepository.findByCompanyIdInOrderByCreatedAtDesc(companyIds);
        }
        return requests.stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ApprovalRequestResponse> getAdditionalServiceRequests(UUID userId, UUID companyId) {
        accessPolicy.requireOwner(userId, companyId);
        return approvalRequestRepository.findByCompanyIdInOrderByCreatedAtDesc(List.of(companyId)).stream()
                .filter(request -> ADDITIONAL_SERVICE_TITLE.equals(request.getTitle()))
                .map(mapper::toResponse)
                .toList();
    }

    private boolean isAdditionalServiceRequest(CreateApprovalRequest request) {
        return request.getType() == RequestType.GENERAL
                && ADDITIONAL_SERVICE_TITLE.equals(request.getTitle());
    }

    private void validateAdditionalServiceRequest(CreateApprovalRequest request, UUID companyId) {
        Set<ServiceCategory> requestedServices = parseAdditionalServices(request.getMetadata());
        boolean hasDuplicate = approvalRequestRepository
                .findByCompanyIdAndStatusOrderByCreatedAtDesc(companyId, RequestStatus.PENDING)
                .stream()
                .filter(existing -> ADDITIONAL_SERVICE_TITLE.equals(existing.getTitle()))
                .map(ApprovalRequest::getMetadata)
                .map(this::parseExistingAdditionalServices)
                .anyMatch(existingServices -> existingServices.stream().anyMatch(requestedServices::contains));
        if (hasDuplicate) {
            throw new IllegalStateException("Seçilen hizmetlerden biri için bekleyen bir talep zaten var");
        }
    }

    private Set<ServiceCategory> parseExistingAdditionalServices(String metadata) {
        try {
            return parseAdditionalServices(metadata);
        } catch (IllegalArgumentException ignored) {
            return Set.of();
        }
    }

    private Set<ServiceCategory> parseAdditionalServices(String metadata) {
        try {
            JsonNode root = objectMapper.readTree(metadata);
            if (root == null || !"ADDITIONAL_SERVICE".equals(root.path("kind").asText())) {
                throw new IllegalArgumentException("Ek hizmet talebi bilgisi geçersiz");
            }

            JsonNode servicesNode = root.path("services");
            if (!servicesNode.isArray() || servicesNode.isEmpty()) {
                throw new IllegalArgumentException("En az bir ek hizmet seçilmelidir");
            }

            Set<ServiceCategory> categories = EnumSet.noneOf(ServiceCategory.class);
            for (JsonNode serviceNode : servicesNode) {
                String id = serviceNode.path("id").asText();
                try {
                    categories.add(ServiceCategory.valueOf(id));
                } catch (IllegalArgumentException exception) {
                    throw new IllegalArgumentException("Bilinmeyen hizmet kategorisi: " + id, exception);
                }
            }
            return categories;
        } catch (IllegalArgumentException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new IllegalArgumentException("Ek hizmet talebi bilgisi okunamadı", exception);
        }
    }

    @Transactional(readOnly = true)
    public List<ApprovalRequestResponse> getPending(UUID userId) {
        return getAll(userId).stream()
                .filter(request -> RequestStatus.PENDING.name().equals(request.getStatus()))
                .toList();
    }

    @Transactional(readOnly = true)
    public long countPending(UUID userId) {
        UserProfile user = getUserOrThrow(userId);
        if (user.getGlobalRole() == GlobalRole.ADMIN) {
            return approvalRequestRepository.countByStatus(RequestStatus.PENDING);
        }
        List<UUID> companyIds = accessPolicy.accessibleCompanyIds(user);
        return companyIds.isEmpty()
                ? 0
                : approvalRequestRepository.countByCompanyIdInAndStatus(companyIds, RequestStatus.PENDING);
    }

    @Transactional
    public ApprovalRequestResponse approve(UUID requestId, UUID reviewerId, ReviewApprovalRequest review) {
        ApprovalRequest request = getPendingRequest(requestId);
        UserProfile reviewer = getUserOrThrow(reviewerId);
        accessPolicy.requireCompanyAccess(reviewer, request.getCompany().getId());

        if (request.getType() == RequestType.CONTENT_APPROVAL) {
            executeContentApproval(request, reviewerId, review);
        }
        markReviewed(request, reviewer, RequestStatus.APPROVED, review != null ? review.getNote() : null);
        return mapper.toResponse(approvalRequestRepository.save(request));
    }

    @Transactional
    public ApprovalRequestResponse reject(UUID requestId, UUID reviewerId, String note) {
        ApprovalRequest request = getPendingRequest(requestId);
        UserProfile reviewer = getUserOrThrow(reviewerId);
        accessPolicy.requireCompanyAccess(reviewer, request.getCompany().getId());
        if (request.getType() == RequestType.CONTENT_APPROVAL) {
            approvalService.reject(request.getReferenceId(), request.getCompany().getId(), reviewerId, note);
        }
        markReviewed(request, reviewer, RequestStatus.REJECTED, note);
        return mapper.toResponse(approvalRequestRepository.save(request));
    }

    private void validateContentApproval(CreateApprovalRequest request, UUID userId) {
        if (request.getReferenceId() == null) {
            throw new IllegalArgumentException("İçerik onayı için referans zorunludur");
        }
        ContentPlan plan = contentPlanService.getPlanForApproval(
                request.getReferenceId(), request.getCompanyId(), userId, false);
        if (plan.getStatus() != com.fogistanbul.crm.entity.enums.ContentStatus.WAITING_APPROVAL) {
            throw new IllegalStateException("Yalnızca onay bekleyen içerikler için istek oluşturulabilir");
        }
        approvalRequestRepository.findByReferenceIdAndTypeAndStatus(
                request.getReferenceId(), RequestType.CONTENT_APPROVAL, RequestStatus.PENDING)
                .ifPresent(existing -> {
                    throw new IllegalStateException("Bu içerik için bekleyen bir onay isteği zaten var");
                });
        metadataCodec.parse(request.getMetadata());
    }

    private void executeContentApproval(
            ApprovalRequest request, UUID reviewerId, ReviewApprovalRequest review
    ) {
        ContentApprovalMetadata.Details details = metadataCodec.merge(
                metadataCodec.parse(request.getMetadata()), review);
        if (details.existingShootId() != null) {
            approvalService.approveExisting(
                    request.getReferenceId(), request.getCompany().getId(),
                    details.existingShootId(), reviewerId);
            return;
        }
        approvalService.approveNew(
                request.getReferenceId(), request.getCompany().getId(),
                reviewerId, details, review);
    }

    private ApprovalRequest getPendingRequest(UUID requestId) {
        ApprovalRequest request = approvalRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("İstek bulunamadı"));
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Bu istek daha once sonuclandirilmis");
        }
        return request;
    }

    private UserProfile getUserOrThrow(UUID userId) {
        return userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
    }

    private void markReviewed(
            ApprovalRequest request, UserProfile reviewer, RequestStatus status, String note
    ) {
        request.setStatus(status);
        request.setReviewedBy(reviewer);
        request.setReviewNote(note);
        request.setReviewedAt(LocalDateTime.now());
    }
}
