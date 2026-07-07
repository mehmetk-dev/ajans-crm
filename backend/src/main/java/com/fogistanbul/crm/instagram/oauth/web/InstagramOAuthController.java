package com.fogistanbul.crm.instagram.oauth.web;

import com.fogistanbul.crm.exception.ApiException;
import com.fogistanbul.crm.instagram.oauth.application.InstagramOAuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/oauth/instagram")
@RequiredArgsConstructor
public class InstagramOAuthController {

    private static final Logger log = LoggerFactory.getLogger(InstagramOAuthController.class);

    private final InstagramOAuthService instagramOAuthService;

    @GetMapping("/callback")
    public void callback(@RequestParam(required = false) String code,
                         @RequestParam(required = false) String state,
                         @RequestParam(required = false) String error,
                         @RequestParam(required = false) String error_description,
                         HttpServletResponse response) throws IOException {
        if (error != null && !error.isBlank()) {
            log.warn("Instagram OAuth kullanıcı tarafından reddedildi: {} ({})", error, error_description);
            redirectWithError(response, state,
                    error_description != null ? error_description.replace('+', ' ') : "Instagram bağlantısı iptal edildi");
            return;
        }

        if (code == null || code.isBlank()) {
            log.warn("Instagram OAuth callback — code parametresi eksik");
            redirectWithError(response, state, "Instagram bağlantısı tamamlanamadı");
            return;
        }

        if (state == null || state.isBlank()) {
            state = "";
        }

        try {
            String returnPath = instagramOAuthService.handleCallback(code, state);
            response.sendRedirect(instagramOAuthService.getFrontendUrl()
                    + returnPath + "?ig=connected");
        } catch (ApiException e) {
            log.warn("Instagram OAuth callback reddedildi: {}", e.getMessage());
            redirectWithError(response, state, e.getMessage());
        } catch (Exception e) {
            log.error("Instagram OAuth callback hatası: {}", e.getMessage(), e);
            redirectWithError(response, state, e.getMessage());
        }
    }

    private void redirectWithError(HttpServletResponse response, String state, String message) throws IOException {
        String msg = URLEncoder.encode(message != null ? message : "Instagram bağlantısı tamamlanamadı", StandardCharsets.UTF_8);
        String returnPath = instagramOAuthService.resolveReturnPath(state);
        response.sendRedirect(instagramOAuthService.getFrontendUrl()
                + returnPath + "?ig=error&message=" + msg);
    }
}
