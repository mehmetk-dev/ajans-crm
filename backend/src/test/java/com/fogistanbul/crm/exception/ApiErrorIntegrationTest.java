package com.fogistanbul.crm.exception;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiErrorIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void unauthenticatedRequestsUseTheStandardErrorEnvelope() throws Exception {
        mockMvc.perform(get("/api/admin/users").header("X-Request-ID", "security-123"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string("X-Request-ID", "security-123"))
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"))
                .andExpect(jsonPath("$.path").value("/api/admin/users"))
                .andExpect(jsonPath("$.requestId").value("security-123"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void unknownApiRoutesUseTheStandardNotFoundEnvelope() throws Exception {
        mockMvc.perform(get("/api/not-a-real-route").with(authentication(adminAuthentication())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"))
                .andExpect(jsonPath("$.path").value("/api/not-a-real-route"))
                .andExpect(jsonPath("$.requestId").exists());
    }

    @Test
    void malformedJsonUsesTheStandardBadRequestEnvelope() throws Exception {
        mockMvc.perform(put("/api/admin/users/{id}/role", UUID.randomUUID())
                        .with(authentication(adminAuthentication()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("MALFORMED_REQUEST"))
                .andExpect(jsonPath("$.message").value("İstek gövdesi okunamadı"))
                .andExpect(jsonPath("$.path").exists())
                .andExpect(jsonPath("$.requestId").exists());
    }

    private UsernamePasswordAuthenticationToken adminAuthentication() {
        return new UsernamePasswordAuthenticationToken(
                UUID.randomUUID(),
                null,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );
    }
}
