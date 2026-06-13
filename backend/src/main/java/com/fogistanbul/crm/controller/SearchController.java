package com.fogistanbul.crm.controller;

import com.fogistanbul.crm.dto.SearchResponse;
import com.fogistanbul.crm.security.CurrentUser;
import com.fogistanbul.crm.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;
    private final CurrentUser currentUser;

    @GetMapping
    public SearchResponse search(
            @RequestParam String q,
            Authentication auth) {
        String role = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.substring(5))
                .findFirst()
                .orElse("AGENCY_STAFF");
        return searchService.search(q, currentUser.id(auth), role);
    }
}
