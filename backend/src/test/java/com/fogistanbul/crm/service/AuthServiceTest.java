package com.fogistanbul.crm.service;

import com.fogistanbul.crm.dto.LoginRequest;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.CompanyMembership;
import com.fogistanbul.crm.entity.RefreshToken;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.entity.enums.MembershipRole;
import com.fogistanbul.crm.instagram.application.InstagramLoginWarmupService;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.RefreshTokenRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    UserProfileRepository userProfileRepository;

    @Mock
    RefreshTokenRepository refreshTokenRepository;

    @Mock
    CompanyMembershipRepository companyMembershipRepository;

    @Mock
    JwtTokenProvider jwtTokenProvider;

    @Mock
    PasswordEncoder passwordEncoder;

    @Mock
    ActivityLogService activityLogService;

    @Mock
    InstagramLoginWarmupService instagramLoginWarmupService;

    AuthService service;

    @BeforeEach
    void setUp() {
        service = new AuthService(
                userProfileRepository,
                refreshTokenRepository,
                companyMembershipRepository,
                jwtTokenProvider,
                passwordEncoder,
                activityLogService,
                instagramLoginWarmupService);
        org.springframework.test.util.ReflectionTestUtils.setField(
                service, "refreshTokenExpirationMs", 86_400_000L);
    }

    @Test
    void login_warmsUpOnlyTheCompanyUsersOwnInstagramCompany() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        LoginRequest request = loginRequest("client@example.com");
        UserProfile user = user(userId, "client@example.com", GlobalRole.COMPANY_USER);

        when(userProfileRepository.findByEmail("client@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret", "hash")).thenReturn(true);
        when(jwtTokenProvider.generateAccessToken(userId, "client@example.com", "COMPANY_USER"))
                .thenReturn("access");
        when(jwtTokenProvider.generateRefreshToken(userId)).thenReturn("refresh");
        when(companyMembershipRepository.findByUserId(userId)).thenReturn(List.of(
                CompanyMembership.builder()
                        .company(Company.builder().id(companyId).name("Client").build())
                        .membershipRole(MembershipRole.OWNER)
                        .build()));

        service.login(request);

        verify(refreshTokenRepository).save(any(RefreshToken.class));
        verify(instagramLoginWarmupService).warmUpCompany(companyId);
    }

    @Test
    void login_doesNotWarmUpInstagramForAgencyUsers() {
        UUID userId = UUID.randomUUID();
        LoginRequest request = loginRequest("admin@example.com");
        UserProfile user = user(userId, "admin@example.com", GlobalRole.ADMIN);

        when(userProfileRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret", "hash")).thenReturn(true);
        when(jwtTokenProvider.generateAccessToken(userId, "admin@example.com", "ADMIN"))
                .thenReturn("access");
        when(jwtTokenProvider.generateRefreshToken(userId)).thenReturn("refresh");

        service.login(request);

        verify(refreshTokenRepository).save(any(RefreshToken.class));
        verify(instagramLoginWarmupService, never()).warmUpCompany(any());
    }

    private LoginRequest loginRequest(String email) {
        LoginRequest request = new LoginRequest();
        request.setEmail(email);
        request.setPassword("secret");
        request.setRememberMe(false);
        return request;
    }

    private UserProfile user(UUID userId, String email, GlobalRole role) {
        return UserProfile.builder()
                .id(userId)
                .email(email)
                .passwordHash("hash")
                .globalRole(role)
                .build();
    }
}
