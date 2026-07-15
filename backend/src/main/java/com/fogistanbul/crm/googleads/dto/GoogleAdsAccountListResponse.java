package com.fogistanbul.crm.googleads.dto;

import java.util.List;

public record GoogleAdsAccountListResponse(
        List<GoogleAdsAccountOption> accounts,
        List<String> warnings
) {
}
