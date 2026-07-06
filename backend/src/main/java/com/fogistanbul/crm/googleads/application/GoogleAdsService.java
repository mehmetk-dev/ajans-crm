package com.fogistanbul.crm.googleads.application;

import com.fogistanbul.crm.googleads.dto.GoogleAdsOverviewResponse;
import com.fogistanbul.crm.googleads.infrastructure.GoogleAdsClient;
import com.fogistanbul.crm.googleoauth.application.GoogleOAuthService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleAdsService {

    private static final Logger log = LoggerFactory.getLogger(GoogleAdsService.class);
    private static final String DEFAULT_START = "30daysAgo";
    private static final String DEFAULT_END = "today";

    private final GoogleOAuthService oAuthService;
    private final GoogleAdsClient client;
    private final GoogleAdsMapper mapper;

    public GoogleAdsOverviewResponse getOverview(UUID companyId, String startDate, String endDate) {
        if (!oAuthService.isConnected(companyId, GoogleOAuthService.SVC_GOOGLE_ADS)) {
            return GoogleAdsOverviewResponse.disabled();
        }

        String customerId = oAuthService.getAdsCustomerId(companyId)
                .map(mapper::sanitizeCustomerId)
                .orElse("");
        if (customerId.isBlank()) {
            return GoogleAdsOverviewResponse.error(
                    null, "Google Ads müşteri ID'si girilmemiş.");
        }

        String accessToken = oAuthService
                .getValidAccessToken(companyId, GoogleOAuthService.SVC_GOOGLE_ADS)
                .orElse(null);
        if (accessToken == null) {
            return GoogleAdsOverviewResponse.error(
                    customerId, "Geçerli access token bulunamadı.");
        }
        if (!client.isConfigured()) {
            return GoogleAdsOverviewResponse.error(
                    customerId, "Google Ads developer token yapılandırılmamış.");
        }

        LocalDate today = LocalDate.now();
        String rangeStart = mapper.resolveDate(valueOrDefault(startDate, DEFAULT_START), today);
        String rangeEnd = mapper.resolveDate(valueOrDefault(endDate, DEFAULT_END), today);

        try {
            return mapper.toOverviewResponse(
                    customerId,
                    client.fetchCampaigns(accessToken, customerId, rangeStart, rangeEnd),
                    client.fetchDailyTrend(accessToken, customerId, rangeStart, rangeEnd));
        } catch (Exception exception) {
            String message = exception.getMessage() != null ? exception.getMessage() : "";
            if (isExpectedAuthorizationFailure(message)) {
                log.warn("Google Ads overview yetki hatası, company={}: {}", companyId, message);
            } else {
                log.error("Google Ads overview hatası, company={}: {}", companyId, message, exception);
            }
            return GoogleAdsOverviewResponse.error(
                    customerId, mapper.toUserErrorMessage(message));
        }
    }

    static boolean isExpectedAuthorizationFailure(String message) {
        if (message == null) {
            return false;
        }
        return message.contains("401")
                || message.contains("403")
                || message.contains("UNAUTHENTICATED")
                || message.contains("PERMISSION_DENIED");
    }

    private String valueOrDefault(String value, String defaultValue) {
        return value != null && !value.isBlank() ? value : defaultValue;
    }
}
