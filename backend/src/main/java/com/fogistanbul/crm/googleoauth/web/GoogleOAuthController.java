package com.fogistanbul.crm.googleoauth.web;

import com.fogistanbul.crm.googleoauth.application.GoogleOAuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

/**
 * Google OAuth 2.0 callback endpoint.
 * Bu endpoint herkese açık (permitAll) — JWT gerektirmez.
 * Google, kullanıcıyı buraya yönlendirir.
 */
@RestController
@RequestMapping("/api/oauth/google")
@RequiredArgsConstructor
public class GoogleOAuthController {

    private static final Logger log = LoggerFactory.getLogger(GoogleOAuthController.class);

    private final GoogleOAuthService googleOAuthService;

    /**
     * Google'dan dönen callback.
     * ?code=...&state=<companyId>
     */
    @GetMapping("/callback")
    public void callback(@RequestParam(required = false) String code,
                         @RequestParam(required = false) String error,
                         @RequestParam String state,
                         HttpServletResponse response) throws IOException {
        try {
            if (error != null && !error.isBlank()) {
                redirectWithError(response, googleOAuthService.getRedirectPathForState(state),
                        "Google bağlantı izni reddedildi");
                return;
            }
            if (code == null || code.isBlank()) {
                redirectWithError(response, googleOAuthService.getRedirectPathForState(state),
                        "Google bağlantı kodu alınamadı");
                return;
            }
            String redirectPath = googleOAuthService.handleCallback(code, state);
            response.sendRedirect(googleOAuthService.getFrontendUrl() + redirectPath);
        } catch (Exception e) {
            log.error("OAuth callback hatası: {}", e.getMessage(), e);
            redirectWithError(response, safeRedirectPath(state), e.getMessage());
        }
    }

    private String safeRedirectPath(String state) {
        try {
            return googleOAuthService.getRedirectPathForState(state);
        } catch (Exception ignored) {
            return "/client/analytics";
        }
    }

    private void redirectWithError(HttpServletResponse response, String redirectPath, String message)
            throws IOException {
        String location = UriComponentsBuilder
                .fromUriString(googleOAuthService.getFrontendUrl() + redirectPath)
                .replaceQueryParam("connected")
                .queryParam("oauthError", message != null && !message.isBlank()
                        ? message
                        : "Google bağlantısı tamamlanamadı")
                .build()
                .encode()
                .toUriString();
        response.sendRedirect(location);
    }
}
