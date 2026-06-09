package com.fogistanbul.crm.company.web;

import com.fogistanbul.crm.company.application.ClientTeamService;
import com.fogistanbul.crm.company.dto.TeamResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/client/team")
@RequiredArgsConstructor
public class ClientTeamController {

    private final ClientTeamService clientTeamService;

    @GetMapping
    public ResponseEntity<TeamResponse> getTeam(Authentication auth) {
        return ResponseEntity.ok(clientTeamService.getTeam((UUID) auth.getPrincipal()));
    }
}
