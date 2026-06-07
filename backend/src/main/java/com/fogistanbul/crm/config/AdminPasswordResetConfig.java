package com.fogistanbul.crm.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Geçici yardımcı — admin şifresini uygulama başladığında sıfırlar.
 * Kullanım: spring.profiles.active=reset-admin-pass ile başlat,
 * ya da application.properties'de crm.reset-admin-password=true yap.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
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
            log.info("✅ Şifreler sıfırlandı. Admin: {}, Suleyman: {}. Yeni şifre: {}", updatedAdmin, updatedSuleyman, newPassword);
        };
    }
}
