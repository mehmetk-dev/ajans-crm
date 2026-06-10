package com.fogistanbul.crm.contentplan.application;

import com.fogistanbul.crm.entity.ApprovalRequest;
import com.fogistanbul.crm.entity.ContentPlan;
import com.fogistanbul.crm.entity.enums.ContentStatus;
import com.fogistanbul.crm.entity.enums.RequestStatus;
import com.fogistanbul.crm.entity.enums.RequestType;
import com.fogistanbul.crm.repository.ApprovalRequestRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ContentPlanWorkflowPolicyTest {

    @Mock
    private ApprovalRequestRepository approvalRequestRepository;

    @Test
    void rejectsInvalidStatusTransition() {
        ContentPlanWorkflowPolicy policy = new ContentPlanWorkflowPolicy(approvalRequestRepository);
        ContentPlan plan = ContentPlan.builder()
                .id(UUID.randomUUID())
                .status(ContentStatus.DRAFT)
                .build();

        assertThrows(IllegalStateException.class, () ->
                policy.requireStatusChange(plan, ContentStatus.PUBLISHED));
    }

    @Test
    void pendingApprovalCannotBeBypassedByDirectStatusUpdate() {
        ContentPlanWorkflowPolicy policy = new ContentPlanWorkflowPolicy(approvalRequestRepository);
        UUID planId = UUID.randomUUID();
        ContentPlan plan = ContentPlan.builder()
                .id(planId)
                .status(ContentStatus.WAITING_APPROVAL)
                .build();
        when(approvalRequestRepository.findByReferenceIdAndTypeAndStatus(
                planId, RequestType.CONTENT_APPROVAL, RequestStatus.PENDING))
                .thenReturn(Optional.of(ApprovalRequest.builder().id(UUID.randomUUID()).build()));

        assertThrows(IllegalStateException.class, () ->
                policy.requireStatusChange(plan, ContentStatus.APPROVED));
    }

    @Test
    void approvalResolutionUsesTheSameTransitionWithoutBypassCheck() {
        ContentPlanWorkflowPolicy policy = new ContentPlanWorkflowPolicy(approvalRequestRepository);
        ContentPlan plan = ContentPlan.builder()
                .id(UUID.randomUUID())
                .status(ContentStatus.WAITING_APPROVAL)
                .build();

        assertDoesNotThrow(() ->
                policy.requireApprovalResolution(plan, ContentStatus.APPROVED));
    }
}
