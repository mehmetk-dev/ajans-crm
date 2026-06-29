package com.fogistanbul.crm.controller;

import com.fogistanbul.crm.dto.AdminAnalyticsResponse;
import com.fogistanbul.crm.dto.StaffAnalyticsResponse;
import com.fogistanbul.crm.service.AdminAnalyticsService;
import com.fogistanbul.crm.service.StaffAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/analytics")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminAnalyticsController {

    private final AdminAnalyticsService adminAnalyticsService;
    private final StaffAnalyticsService staffAnalyticsService;

    @GetMapping
    public ResponseEntity<AdminAnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(adminAnalyticsService.getAnalytics());
    }

    @GetMapping("/staff/{userId}")
    public ResponseEntity<StaffAnalyticsResponse> getStaffAnalytics(@PathVariable UUID userId) {
        return ResponseEntity.ok(staffAnalyticsService.getAnalytics(userId));
    }
}
