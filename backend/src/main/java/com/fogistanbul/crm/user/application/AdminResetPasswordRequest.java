package com.fogistanbul.crm.user.application;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminResetPasswordRequest(
        @NotBlank(message = "Admin şifresi zorunludur")
        @Size(max = 128, message = "Admin şifresi en fazla 128 karakter olabilir")
        String adminPassword,
        @NotBlank(message = "Yeni şifre zorunludur")
        @Size(min = 8, max = 128, message = "Yeni şifre 8 ile 128 karakter arasında olmalıdır")
        String newPassword
) {
}
