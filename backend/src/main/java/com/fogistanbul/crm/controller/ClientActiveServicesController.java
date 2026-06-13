package com.fogistanbul.crm.controller;

import com.fogistanbul.crm.company.application.ClientActiveServicesService;
import com.fogistanbul.crm.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/client")
@RequiredArgsConstructor
public class ClientActiveServicesController {

    private final ClientActiveServicesService activeServicesService;
    private final CurrentUser currentUser;

    @GetMapping("/active-services")
    public ResponseEntity<Map<String, List<String>>> getActiveServices(Authentication auth) {
        return ResponseEntity.ok(Map.of(
                "activeServices",
                activeServicesService.getActiveServices(currentUser.id(auth))
        ));
    }
}
