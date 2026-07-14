package com.fogistanbul.crm.contentplan.web;

import com.fogistanbul.crm.contentplan.application.ApprovalRequestService;
import com.fogistanbul.crm.contentplan.dto.ApprovalRequestResponse;
import com.fogistanbul.crm.contentplan.dto.CreateApprovalRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping("/api/client/approval-requests")
@RequiredArgsConstructor
public class ClientApprovalController {

    private final ApprovalRequestService approvalRequestService;

    @PostMapping
    public ResponseEntity<ApprovalRequestResponse> create(
            @Valid @RequestBody CreateApprovalRequest request,
            Authentication auth
    ) {
        return ResponseEntity.ok(approvalRequestService.create(
                request, (UUID) auth.getPrincipal()));
    }

    @GetMapping("/additional-services")
    public ResponseEntity<List<ApprovalRequestResponse>> listAdditionalServices(
            @RequestParam UUID companyId,
            Authentication auth
    ) {
        return ResponseEntity.ok(approvalRequestService.getAdditionalServiceRequests(
                (UUID) auth.getPrincipal(), companyId));
    }
}
