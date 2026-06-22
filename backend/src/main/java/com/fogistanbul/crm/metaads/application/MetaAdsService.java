package com.fogistanbul.crm.metaads.application;

import com.fogistanbul.crm.instagram.oauth.application.InstagramOAuthService;
import com.fogistanbul.crm.metaads.dto.MetaAdsOverviewResponse;
import com.fogistanbul.crm.metaads.infrastructure.MetaAdsClient;
import com.fogistanbul.crm.metaads.infrastructure.MetaAdsClient.DateRange;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MetaAdsService {

    private static final Logger log = LoggerFactory.getLogger(MetaAdsService.class);

    private final InstagramOAuthService oAuthService;
    private final MetaAdsAccountService accountService;
    private final MetaAdsClient client;
    private final MetaAdsMapper mapper;

    public MetaAdsOverviewResponse getOverview(
            UUID companyId,
            String startDate,
            String endDate) {
        if (!oAuthService.isConnected(companyId)) {
            return MetaAdsOverviewResponse.disabled();
        }

        String adAccountId = accountService.getAdAccountId(companyId).orElse(null);
        if (adAccountId == null || adAccountId.isBlank()) {
            return MetaAdsOverviewResponse.missingAccount();
        }

        String accessToken = oAuthService.getValidAccessToken(companyId).orElse(null);
        if (accessToken == null) {
            return MetaAdsOverviewResponse.error(
                    adAccountId, "Geçerli access token bulunamadı.");
        }

        DateRange dateRange = DateRange.resolve(startDate, endDate);
        try {
            return mapper.toOverviewResponse(
                    adAccountId,
                    client.fetchAccountName(adAccountId, accessToken),
                    client.fetchAccountInsights(adAccountId, accessToken, dateRange),
                    client.fetchCampaignInsights(adAccountId, accessToken, dateRange),
                    client.fetchDailyInsights(adAccountId, accessToken, dateRange));
        } catch (Exception exception) {
            String message = exception.getMessage() != null
                    ? exception.getMessage()
                    : "";
            log.error(
                    "Meta Ads overview hatası, company={}: {}",
                    companyId, message, exception);
            return MetaAdsOverviewResponse.error(
                    adAccountId, mapper.toUserErrorMessage(message));
        }
    }
}
