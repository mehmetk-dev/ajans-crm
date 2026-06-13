package com.fogistanbul.crm.controller;

import com.fogistanbul.crm.dto.AuthResponse;
import com.fogistanbul.crm.dto.LoginRequest;
import com.fogistanbul.crm.exception.ApiException;
import com.fogistanbul.crm.security.CurrentUser;
import com.fogistanbul.crm.security.LoginRateLimiter;
import com.fogistanbul.crm.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final LoginRateLimiter rateLimiter;
    private final CurrentUser currentUser;

    @Value("${app.cookie.secure:true}")
    private boolean cookieSecure;

    @Value("${app.jwt.access-token-expiration-ms}")
    private long accessTokenExpirationMs;

    @Value("${app.jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse.UserInfo> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        String clientIp = getClientIp(httpRequest);
        if (rateLimiter.isRateLimited(clientIp)) {
            throw new ApiException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "LOGIN_RATE_LIMITED",
                    "Çok fazla giriş denemesi yaptınız. Lütfen daha sonra tekrar deneyin"
            );
        }

        try {
            AuthResponse authResponse = authService.login(request);
            addTokenCookies(httpResponse, authResponse.getAccessToken(), authResponse.getRefreshToken());
            return ResponseEntity.ok(authResponse.getUser());
        } catch (ApiException ex) {
            if ("INVALID_CREDENTIALS".equals(ex.getCode())) {
                rateLimiter.recordAttempt(clientIp);
            }
            throw ex;
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse.UserInfo> refresh(
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        String refreshToken = extractCookieValue(httpRequest, "refresh_token");
        if (refreshToken == null) {
            throw new ApiException(
                    HttpStatus.UNAUTHORIZED,
                    "REFRESH_TOKEN_REQUIRED",
                    "Refresh token bulunamadı"
            );
        }
        AuthResponse authResponse = authService.refreshToken(refreshToken);
        addTokenCookies(httpResponse, authResponse.getAccessToken(), authResponse.getRefreshToken());
        return ResponseEntity.ok(authResponse.getUser());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        String refreshToken = extractCookieValue(httpRequest, "refresh_token");
        authService.revokeRefreshToken(refreshToken);
        clearTokenCookies(httpResponse);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserInfo> me(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.ok(authService.getCurrentUser(currentUser.id(authentication)));
    }

    @GetMapping("/csrf")
    public ResponseEntity<Void> csrf() {
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    private void addTokenCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        ResponseCookie accessCookie = ResponseCookie.from("access_token", accessToken)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(Duration.ofMillis(accessTokenExpirationMs))
                .sameSite("Strict")
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/api/auth")
                .maxAge(Duration.ofMillis(refreshTokenExpirationMs))
                .sameSite("Strict")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
    }

    private void clearTokenCookies(HttpServletResponse response) {
        ResponseCookie accessCookie = ResponseCookie.from("access_token", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/api/auth")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
    }

    private String extractCookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (name.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isEmpty()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
