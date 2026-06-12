package com.fogistanbul.crm.searchconsole.application;

import com.fogistanbul.crm.searchconsole.dto.ScOverviewResponse;
import com.fogistanbul.crm.searchconsole.dto.ScSiteResponse;
import com.fogistanbul.crm.searchconsole.infrastructure.SearchConsoleClient;
import com.fogistanbul.crm.searchconsole.infrastructure.SearchConsoleClient.QueryRow;
import com.fogistanbul.crm.service.GoogleOAuthService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SearchConsoleService {

    private static final Logger log = LoggerFactory.getLogger(SearchConsoleService.class);
    private static final String DEFAULT_START = "30daysAgo";
    private static final String DEFAULT_END = "today";

    private final GoogleOAuthService oAuthService;
    private final SearchConsoleClient client;
    private final SearchConsoleMapper mapper;

    public boolean isConfigured(UUID companyId) {
        return oAuthService.isConnected(companyId, GoogleOAuthService.SVC_SEARCH_CONSOLE)
                && oAuthService.getSiteUrl(companyId).isPresent();
    }

    public List<ScSiteResponse> listSites(UUID companyId) {
        String accessToken = oAuthService
                .getValidAccessToken(companyId, GoogleOAuthService.SVC_SEARCH_CONSOLE)
                .orElse(null);
        if (accessToken == null) {
            return List.of();
        }

        try {
            return client.listSites(accessToken);
        } catch (Exception exception) {
            log.error("SC site listesi alınamadı, companyId={}: {}",
                    companyId, exception.getMessage());
            return List.of();
        }
    }

    public ScOverviewResponse getOverview(UUID companyId, String startDate, String endDate) {
        if (!oAuthService.isConnected(companyId, GoogleOAuthService.SVC_SEARCH_CONSOLE)) {
            return ScOverviewResponse.disabled();
        }

        String siteUrl = oAuthService.getSiteUrl(companyId).orElse(null);
        if (siteUrl == null || siteUrl.isBlank()) {
            return mapper.emptyConnectedResponse();
        }

        String accessToken = oAuthService
                .getValidAccessToken(companyId, GoogleOAuthService.SVC_SEARCH_CONSOLE)
                .orElse(null);
        if (accessToken == null) {
            log.warn("SC access token alınamadı, companyId={}", companyId);
            return ScOverviewResponse.disabled();
        }

        String rangeStart = mapper.resolveDate(
                valueOrDefault(startDate, DEFAULT_START), LocalDate.now());
        String rangeEnd = mapper.resolveDate(
                valueOrDefault(endDate, DEFAULT_END), LocalDate.now());

        try {
            List<QueryRow> overviewRows = client.query(
                    accessToken, siteUrl, rangeStart, rangeEnd, null, 1);
            List<QueryRow> dailyRows = client.query(
                    accessToken, siteUrl, rangeStart, rangeEnd, "date", 500);
            List<QueryRow> queryRows = client.query(
                    accessToken, siteUrl, rangeStart, rangeEnd, "query", 10);
            List<QueryRow> pageRows = client.query(
                    accessToken, siteUrl, rangeStart, rangeEnd, "page", 10);
            List<QueryRow> deviceRows = client.query(
                    accessToken, siteUrl, rangeStart, rangeEnd, "device", 5);
            List<QueryRow> countryRows = client.query(
                    accessToken, siteUrl, rangeStart, rangeEnd, "country", 8);

            return mapper.toOverviewResponse(
                    siteUrl,
                    overviewRows,
                    dailyRows,
                    queryRows,
                    pageRows,
                    deviceRows,
                    countryRows);
        } catch (Exception exception) {
            String message = exception.getMessage() != null ? exception.getMessage() : "";
            log.error("SC API hatası, companyId={}: {}", companyId, message);
            return ScOverviewResponse.error(siteUrl, mapper.toUserErrorMessage(message));
        }
    }

    private String valueOrDefault(String value, String defaultValue) {
        return value != null && !value.isBlank() ? value : defaultValue;
    }
}
