package com.fogistanbul.crm.user.application;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AdminResetPasswordRequestTest {

    private static Validator validator;

    @BeforeAll
    static void createValidator() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void validPasswordsPassValidation() {
        AdminResetPasswordRequest request = new AdminResetPasswordRequest(
                "admin-current",
                "new-pass"
        );

        assertTrue(validator.validate(request).isEmpty());
    }

    @Test
    void blankAdminPasswordIsRejected() {
        AdminResetPasswordRequest request = new AdminResetPasswordRequest("", "new-pass");

        assertFalse(validator.validateProperty(request, "adminPassword").isEmpty());
    }

    @Test
    void adminPasswordLongerThan128CharactersIsRejected() {
        AdminResetPasswordRequest request = new AdminResetPasswordRequest(
                "a".repeat(129),
                "new-pass"
        );

        assertFalse(validator.validateProperty(request, "adminPassword").isEmpty());
    }

    @Test
    void newPasswordShorterThanEightCharactersIsRejected() {
        AdminResetPasswordRequest request = new AdminResetPasswordRequest(
                "admin-current",
                "short"
        );

        assertFalse(validator.validateProperty(request, "newPassword").isEmpty());
    }

    @Test
    void newPasswordLongerThan128CharactersIsRejected() {
        AdminResetPasswordRequest request = new AdminResetPasswordRequest(
                "admin-current",
                "n".repeat(129)
        );

        assertFalse(validator.validateProperty(request, "newPassword").isEmpty());
    }
}
