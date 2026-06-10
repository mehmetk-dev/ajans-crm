package com.fogistanbul.crm.contentplan.web;

import com.fogistanbul.crm.contentplan.application.ApprovalRequestService;
import com.fogistanbul.crm.contentplan.dto.ApprovalRequestResponse;
import com.fogistanbul.crm.contentplan.dto.ReviewApprovalRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff/approval-requests")
@RequiredArgsConstructor
public class StaffApprovalController {

    private final ApprovalRequestService approvalRequestService;

    @GetMapping
    public ResponseEntity<List<ApprovalRequestResponse>> getAll(Authentication auth) {
        return ResponseEntity.ok(approvalRequestService.getAll(userId(auth)));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ApprovalRequestResponse>> getPending(Authentication auth) {
        return ResponseEntity.ok(approvalRequestService.getPending(userId(auth)));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> countPending(Authentication auth) {
        return ResponseEntity.ok(Map.of("count", approvalRequestService.countPending(userId(auth))));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApprovalRequestResponse> approve(
            @PathVariable UUID id,
            @RequestBody(required = false) ReviewApprovalRequest request,
            Authentication auth
    ) {
        return ResponseEntity.ok(approvalRequestService.approve(id, userId(auth), request));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApprovalRequestResponse> reject(
            @PathVariable UUID id,
            @RequestBody(required = false) ReviewApprovalRequest request,
            Authentication auth
    ) {
        return ResponseEntity.ok(approvalRequestService.reject(
                id, userId(auth), request != null ? request.getNote() : null));
    }

    private UUID userId(Authentication auth) {
        return (UUID) auth.getPrincipal();
    }
}
