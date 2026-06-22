package com.fogistanbul.crm.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Geçici yardımcı — sadece açıkça istenirse admin şifresini sıfırlar.
 * Kullanım: CRM_RESET_ADMIN_PASSWORD=true ile tek seferlik başlat.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(prefix = "crm", name = "reset-admin-password", havingValue = "true")
public class AdminPasswordResetConfig {

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner resetAdminPassword() {
        return args -> {
            String newPassword = "Admin123!";
            String hash = passwordEncoder.encode(newPassword);
            int updatedAdmin = jdbcTemplate.update(
                "UPDATE user_profiles SET password_hash = ? WHERE email = 'admin@fogistanbul.com' AND global_role = 'ADMIN'",
                hash
            );
            int updatedSuleyman = jdbcTemplate.update(
                "UPDATE user_profiles SET password_hash = ? WHERE email = 'suleyman@aydinlife.com'",
                hash
            );
            log.warn("Admin password reset helper ran. Updated users: admin={}, suleyman={}", updatedAdmin, updatedSuleyman);
        };
    }
}
