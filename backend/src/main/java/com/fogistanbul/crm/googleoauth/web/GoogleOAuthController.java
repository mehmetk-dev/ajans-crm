package com.fogistanbul.crm.googleoauth.web;

import com.fogistanbul.crm.googleoauth.application.GoogleOAuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

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
    public void callback(@RequestParam String code,
                         @RequestParam String state,
                         HttpServletResponse response) throws IOException {
        try {
            String redirectPath = googleOAuthService.handleCallback(code, state);
            response.sendRedirect(googleOAuthService.getFrontendUrl() + redirectPath);
        } catch (Exception e) {
            log.error("OAuth callback hatası: {}", e.getMessage(), e);
            response.sendRedirect(googleOAuthService.getFrontendUrl()
                    + "/client/analytics?error=" + e.getMessage());
        }
    }
}
