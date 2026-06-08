package com.fogistanbul.crm.maintenance.web;

import com.fogistanbul.crm.maintenance.application.MaintenanceLogService;
import com.fogistanbul.crm.maintenance.dto.MaintenanceLogResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/client/maintenance-log")
@RequiredArgsConstructor
public class ClientMaintenanceLogController {

    private final MaintenanceLogService maintenanceLogService;

    @GetMapping
    public List<MaintenanceLogResponse> list(Authentication authentication) {
        return maintenanceLogService.listForClient((UUID) authentication.getPrincipal());
    }
}
