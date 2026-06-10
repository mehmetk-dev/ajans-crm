package com.fogistanbul.crm.contentplan.application;

import com.fogistanbul.crm.entity.ContentPlan;
import com.fogistanbul.crm.entity.enums.ContentStatus;
import com.fogistanbul.crm.entity.enums.RequestStatus;
import com.fogistanbul.crm.entity.enums.RequestType;
import com.fogistanbul.crm.repository.ApprovalRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ContentPlanWorkflowPolicy {

    private final ApprovalRequestRepository approvalRequestRepository;

    public void requireStatusChange(ContentPlan plan, ContentStatus target) {
        requireNoPendingApprovalBypass(plan, target);
        requireValidTransition(plan, target);
    }

    public void requireApprovalResolution(ContentPlan plan, ContentStatus target) {
        requireValidTransition(plan, target);
    }

    private void requireValidTransition(ContentPlan plan, ContentStatus target) {
        ContentStatus current = plan.getStatus();
        boolean valid = current == target
                || current == ContentStatus.DRAFT && target == ContentStatus.WAITING_APPROVAL
                || current == ContentStatus.WAITING_APPROVAL
                    && (target == ContentStatus.APPROVED || target == ContentStatus.REVISION)
                || current == ContentStatus.REVISION && target == ContentStatus.WAITING_APPROVAL
                || current == ContentStatus.APPROVED && target == ContentStatus.PUBLISHED;
        if (!valid) {
            throw new IllegalStateException(
                    "Gecersiz icerik durumu gecisi: " + current + " -> " + target);
        }
    }

    private void requireNoPendingApprovalBypass(ContentPlan plan, ContentStatus target) {
        if (plan.getStatus() != ContentStatus.WAITING_APPROVAL
                || target != ContentStatus.APPROVED && target != ContentStatus.REVISION) {
            return;
        }
        approvalRequestRepository.findByReferenceIdAndTypeAndStatus(
                plan.getId(), RequestType.CONTENT_APPROVAL, RequestStatus.PENDING)
                .ifPresent(request -> {
                    throw new IllegalStateException(
                            "Bekleyen onay istegi Istekler ekranindan sonuclandirilmalidir");
                });
    }
}
