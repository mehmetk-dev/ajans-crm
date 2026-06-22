package com.fogistanbul.crm.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class AdminPasswordResetConfigTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(AdminPasswordResetConfig.class)
            .withBean(JdbcTemplate.class, () -> mock(JdbcTemplate.class))
            .withBean(PasswordEncoder.class, () -> mock(PasswordEncoder.class));

    @Test
    void resetRunnerIsDisabledByDefault() {
        contextRunner.run(context ->
                assertThat(context).doesNotHaveBean(CommandLineRunner.class));
    }

    @Test
    void resetRunnerIsEnabledOnlyWhenPropertyIsExplicitlyTrue() {
        contextRunner
                .withPropertyValues("crm.reset-admin-password=true")
                .run(context -> assertThat(context).hasSingleBean(CommandLineRunner.class));
    }
}
