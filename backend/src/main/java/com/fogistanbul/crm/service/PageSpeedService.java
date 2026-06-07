package com.fogistanbul.crm.service;

import com.fogistanbul.crm.dto.PageSpeedReportResponse;
import com.fogistanbul.crm.dto.PageSpeedScoreResponse;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.PageSpeedSnapshot;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.PageSpeedSnapshotRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class PageSpeedService {

    private static final String PAGESPEED_ENDPOINT =
            "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
    private static final Duration CACHE_TTL = Duration.ofHours(24);

    private final CompanyRepository companyRepository;
    private final PageSpeedSnapshotRepository snapshotRepository;
    private final CompanyMembershipRepository membershipRepository;
    private final GoogleOAuthService googleOAuthService;
    private final String apiKey;
    private final RestClient restClient;

    public PageSpeedService(CompanyRepository companyRepository,
                            PageSpeedSnapshotRepository snapshotRepository,
                            CompanyMembershipRepository membershipRepository,
                            GoogleOAuthService googleOAuthService,
                            @Value("${app.pagespeed.api-key:}") String apiKey) {
        this.companyRepository = companyRepository;
        this.snapshotRepository = snapshotRepository;
        this.membershipRepository = membershipRepository;
        this.googleOAuthService = googleOAuthService;
        this.apiKey = apiKey;
        this.restClient = RestClient.builder().build();
    }

    @Transactional
    public PageSpeedReportResponse getReport(UUID companyId, UUID userId, String role, boolean refresh) {
        ensureReadAccess(companyId, userId, role);

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Sirket bulunamadi"));

        String websiteUrl = resolveWebsiteUrl(company);
        String url = normalizeUrl(websiteUrl);
        boolean configured = url != null && !apiKey.isBlank();

        return PageSpeedReportResponse.builder()
                .websiteUrl(websiteUrl)
                .configured(configured)
                .mobile(getOrFetch(company, "mobile", websiteUrl, url, refresh))
                .desktop(getOrFetch(company, "desktop", websiteUrl, url, refresh))
                .hostingProvider(company.getHostingProvider())
                .domainExpiry(company.getDomainExpiry())
                .sslExpiry(company.getSslExpiry())
                .cmsType(company.getCmsType())
                .cmsVersion(company.getCmsVersion())
                .themeName(company.getThemeName())
                .analyticsConnected(googleOAuthService.isConnected(company.getId(), GoogleOAuthService.SVC_ANALYTICS))
                .searchConsoleConnected(googleOAuthService.isConnected(company.getId(), GoogleOAuthService.SVC_SEARCH_CONSOLE))
                .gaPropertyId(googleOAuthService.getPropertyId(company.getId()).orElse(null))
                .searchConsoleSiteUrl(googleOAuthService.getSiteUrl(company.getId()).orElse(null))
                .build();
    }

    @Transactional
    public void updateWebsite(UUID companyId, UUID userId, String role, String websiteUrl) {
        ensureReadAccess(companyId, userId, role);

        String normalized = normalizeUrl(websiteUrl);
        if (normalized == null) {
            throw new RuntimeException("Website adresi bos olamaz");
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Sirket bulunamadi"));
        company.setWebsite(normalized);
        companyRepository.save(company);
    }

    private PageSpeedScoreResponse getOrFetch(Company company, String strategy, String websiteUrl, String url, boolean refresh) {
        Optional<PageSpeedSnapshot> existing = snapshotRepository
                .findByCompanyIdAndStrategy(company.getId(), strategy);

        if (!refresh
                && existing.isPresent()
                && existing.get().getFetchedAt() != null
                && url != null
                && url.equals(existing.get().getTestedUrl())) {
            Instant ageCutoff = Instant.now().minus(CACHE_TTL);
            if (existing.get().getFetchedAt().isAfter(ageCutoff)) {
                return toResponse(existing.get());
            }
        }

        PageSpeedSnapshot snap = existing.orElseGet(() -> {
            PageSpeedSnapshot s = new PageSpeedSnapshot();
            s.setCompany(company);
            s.setStrategy(strategy);
            return s;
        });

        if (url == null) {
            snap.setTestedUrl(websiteUrl != null ? websiteUrl : "");
            snap.setFetchedAt(Instant.now());
            snap.setFetchError("Sirket icin website adresi tanimli degil");
            return toResponse(snapshotRepository.save(snap));
        }

        if (apiKey.isBlank()) {
            snap.setTestedUrl(url);
            snap.setFetchedAt(Instant.now());
            snap.setFetchError("PAGESPEED_API_KEY tanimli degil");
            return toResponse(snapshotRepository.save(snap));
        }

        try {
            Map<?, ?> response = callApi(url, strategy);
            applyResponse(snap, url, response);
            snap.setFetchError(null);
        } catch (Exception ex) {
            log.warn("PageSpeed fetch failed for company={} strategy={}: {}",
                    company.getId(), strategy, ex.getMessage());
            snap.setTestedUrl(url);
            snap.setFetchedAt(Instant.now());
            snap.setFetchError(truncate(ex.getMessage(), 500));
        }

        return toResponse(snapshotRepository.save(snap));
    }

    private Map<?, ?> callApi(String url, String strategy) {
        // PageSpeed API requires the url param unencoded — URI.create avoids encoding
        URI uri = UriComponentsBuilder.fromUriString(PAGESPEED_ENDPOINT)
                .queryParam("url", url)
                .queryParam("strategy", strategy)
                .queryParam("category", "PERFORMANCE")
                .queryParam("category", "ACCESSIBILITY")
                .queryParam("category", "BEST_PRACTICES")
                .queryParam("category", "SEO")
                .queryParam("key", apiKey)
                .build()
                .encode()
                .toUri();

        return restClient.get()
                .uri(uri)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (req, res) -> {
                    String body = new String(res.getBody().readAllBytes(), StandardCharsets.UTF_8);
                    throw new RuntimeException(toPageSpeedErrorMessage(res.getStatusCode().toString(), body));
                })
                .body(Map.class);
    }

    @SuppressWarnings("unchecked")
    private void applyResponse(PageSpeedSnapshot snap, String url, Map<?, ?> response) {
        snap.setTestedUrl(url);
        snap.setFetchedAt(Instant.now());

        Map<String, Object> lh = (Map<String, Object>) response.get("lighthouseResult");
        if (lh == null) {
            return;
        }

        Map<String, Map<String, Object>> categories = (Map<String, Map<String, Object>>) lh.get("categories");
        if (categories != null) {
            snap.setPerformance(toScore(categories.get("performance")));
            snap.setAccessibility(toScore(categories.get("accessibility")));
            snap.setBestPractices(toScore(categories.get("best-practices")));
            snap.setSeo(toScore(categories.get("seo")));
        }

        Map<String, Map<String, Object>> audits = (Map<String, Map<String, Object>>) lh.get("audits");
        if (audits != null) {
            snap.setLcpMs(toNumeric(audits.get("largest-contentful-paint")));
            snap.setFidMs(toNumeric(audits.get("max-potential-fid")));
            snap.setClsValue(toNumeric(audits.get("cumulative-layout-shift")));
            snap.setTbtMs(toNumeric(audits.get("total-blocking-time")));
            snap.setFcpMs(toNumeric(audits.get("first-contentful-paint")));
        }
    }

    private Integer toScore(Map<String, Object> category) {
        if (category == null) return null;
        Object score = category.get("score");
        if (!(score instanceof Number n)) return null;
        return (int) Math.round(n.doubleValue() * 100);
    }

    private Double toNumeric(Map<String, Object> audit) {
        if (audit == null) return null;
        Object value = audit.get("numericValue");
        if (!(value instanceof Number n)) return null;
        return n.doubleValue();
    }

    private PageSpeedScoreResponse toResponse(PageSpeedSnapshot s) {
        return PageSpeedScoreResponse.builder()
                .strategy(s.getStrategy())
                .testedUrl(s.getTestedUrl())
                .performance(s.getPerformance())
                .accessibility(s.getAccessibility())
                .bestPractices(s.getBestPractices())
                .seo(s.getSeo())
                .lcpMs(s.getLcpMs())
                .fidMs(s.getFidMs())
                .clsValue(s.getClsValue())
                .tbtMs(s.getTbtMs())
                .fcpMs(s.getFcpMs())
                .fetchedAt(s.getFetchedAt())
                .fetchError(toDisplayFetchError(s.getFetchError()))
                .build();
    }

    private String resolveWebsiteUrl(Company company) {
        String companyWebsite = normalizeBlank(company.getWebsite());
        if (companyWebsite != null) {
            return companyWebsite;
        }
        return googleOAuthService.getSiteUrl(company.getId())
                .map(this::normalizeBlank)
                .orElse(null);
    }

    private String normalizeBlank(String raw) {
        if (raw == null) return null;
        String trimmed = raw.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeUrl(String raw) {
        String trimmed = normalizeBlank(raw);
        if (trimmed == null) return null;
        if (trimmed.startsWith("sc-domain:")) {
            trimmed = trimmed.substring("sc-domain:".length());
        }
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
            trimmed = "https://" + trimmed;
        }
        return trimmed;
    }

    private void ensureReadAccess(UUID companyId, UUID userId, String role) {
        if ("ROLE_ADMIN".equals(role) || "ROLE_AGENCY_STAFF".equals(role)) {
            return;
        }
        if (!membershipRepository.existsByUserIdAndCompanyId(userId, companyId)) {
            throw new RuntimeException("Bu sirkete erisim yetkiniz yok");
        }
    }

    private String truncate(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max);
    }

    private String toPageSpeedErrorMessage(String status, String body) {
        if (body != null && body.contains("FAILED_DOCUMENT_REQUEST")) {
            return "Google PageSpeed siteyi yukleyemedi. Site tarayicida acilsa bile Google Lighthouse tarafindan engelleniyor, cok yavas yanit veriyor veya bot/guvenlik kurallarina takiliyor olabilir.";
        }
        if (body != null && body.contains("API key not valid")) {
            return "PAGESPEED_API_KEY gecersiz gorunuyor.";
        }
        if (body != null && body.contains("quota")) {
            return "PageSpeed API kotasi dolmus olabilir. Bir sure sonra tekrar deneyin.";
        }
        return "PageSpeed API " + status + ": " + truncate(body, 200);
    }

    private String toDisplayFetchError(String error) {
        if (error == null) return null;
        if (error.contains("FAILED_DOCUMENT_REQUEST")) {
            return "Google PageSpeed siteyi yukleyemedi. Site tarayicida acilsa bile Google Lighthouse tarafindan engelleniyor, cok yavas yanit veriyor veya bot/guvenlik kurallarina takiliyor olabilir.";
        }
        if (error.contains("API key not valid")) {
            return "PAGESPEED_API_KEY gecersiz gorunuyor.";
        }
        if (error.toLowerCase().contains("quota") || error.contains("429")) {
            return "PageSpeed API kotasi dolmus olabilir. Bir sure sonra tekrar deneyin.";
        }
        return error;
    }
}
