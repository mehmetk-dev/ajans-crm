package com.fogistanbul.crm.googleads.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record GoogleAdsAccountSelectionRequest(
        @NotBlank
        @Pattern(regexp = "\\d{10}", message = "Google Ads müşteri ID'si 10 haneli olmalıdır")
        String customerId,
        @NotBlank
        @Pattern(regexp = "\\d{10}", message = "Google Ads yönetici müşteri ID'si 10 haneli olmalıdır")
        String loginCustomerId
) {
}
