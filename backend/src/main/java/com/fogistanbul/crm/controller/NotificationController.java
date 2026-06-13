package com.fogistanbul.crm.controller;

import com.fogistanbul.crm.dto.NotificationResponse;
import com.fogistanbul.crm.security.CurrentUser;
import com.fogistanbul.crm.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUser currentUser;

    @GetMapping
    public Page<NotificationResponse> getNotifications(
            Authentication auth,
            @PageableDefault(size = 20) Pageable pageable) {
        return notificationService.getNotifications(currentUser.id(auth), pageable);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(Authentication auth) {
        return Map.of("count", notificationService.getUnreadCount(currentUser.id(auth)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id, Authentication auth) {
        notificationService.markAsRead(id, currentUser.id(auth));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication auth) {
        notificationService.markAllAsRead(currentUser.id(auth));
        return ResponseEntity.ok().build();
    }
}
