package com.fogistanbul.crm.googleads.application;

import com.fogistanbul.crm.exception.ApiException;
import com.fogistanbul.crm.googleads.dto.GoogleAdsAccountListResponse;
import com.fogistanbul.crm.googleads.dto.GoogleAdsAccountOption;
import com.fogistanbul.crm.googleads.infrastructure.GoogleAdsClient;
import com.fogistanbul.crm.googleads.infrastructure.GoogleAdsClient.CustomerDescriptor;
import com.fogistanbul.crm.googleads.infrastructure.GoogleAdsProviderErrorParser;
import com.fogistanbul.crm.googleads.infrastructure.GoogleAdsProviderErrorParser.ProviderError;
import com.fogistanbul.crm.googleoauth.application.GoogleOAuthService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleAdsAccountDiscoveryService {

    private static final Logger log = LoggerFactory.getLogger(GoogleAdsAccountDiscoveryService.class);
    private static final int MAX_ROOT_ACCOUNTS = 25;
    private static final int MAX_MANAGER_ACCOUNTS = 50;
    private static final int MAX_OPTIONS = 200;

    private final GoogleOAuthService oAuthService;
    private final GoogleAdsClient client;
    private final GoogleAdsProviderErrorParser providerErrorParser;

    public GoogleAdsAccountListResponse discover(UUID companyId) {
        if (!client.isConfigured()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "GOOGLE_ADS_NOT_CONFIGURED",
                    "Google Ads developer token yapılandırılmamış");
        }
        if (!oAuthService.hasAdsScope(companyId)) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "GOOGLE_ADS_SCOPE_REQUIRED",
                    "Google Ads bağlantısını yeniden yetkilendirin");
        }
        String accessToken = oAuthService
                .getValidAccessToken(companyId, GoogleOAuthService.SVC_GOOGLE_ADS)
                .orElseThrow(() -> new ApiException(HttpStatus.CONFLICT,
                        "GOOGLE_ADS_NOT_CONNECTED",
                        "Google Ads bağlantısını yeniden kurun"));

        List<String> rootCustomerIds;
        try {
            rootCustomerIds = client.listAccessibleCustomerIds(accessToken).stream()
                    .limit(MAX_ROOT_ACCOUNTS)
                    .toList();
        } catch (Exception exception) {
            ProviderError providerError = providerErrorParser.parse(exception);
            log.warn("Google Ads erişilebilir hesaplar alınamadı, company={}, errorType={}, "
                            + "httpStatus={}, providerCode={}, providerRequestId={}",
                    companyId,
                    exception.getClass().getSimpleName(),
                    providerError.httpStatus(),
                    providerError.providerCode(),
                    providerError.requestId());
            throw new ApiException(HttpStatus.BAD_GATEWAY,
                    "GOOGLE_ADS_ACCOUNT_DISCOVERY_FAILED",
                    "Google Ads hesapları alınamadı. Bağlantıyı kontrol edip tekrar deneyin");
        }

        Map<String, GoogleAdsAccountOption> options = new LinkedHashMap<>();
        List<String> warnings = new ArrayList<>();
        for (String rootCustomerId : rootCustomerIds) {
            if (options.size() >= MAX_OPTIONS) {
                break;
            }
            try {
                CustomerDescriptor root = client.fetchCustomer(
                        accessToken, rootCustomerId, null);
                if (!isEnabled(root)) {
                    continue;
                }
                if (!root.manager()) {
                    options.put(root.customerId(), directOption(root));
                    continue;
                }
                discoverManagerChildren(accessToken, root, options, warnings, companyId);
            } catch (Exception exception) {
                ProviderError providerError = providerErrorParser.parse(exception);
                log.warn("Google Ads hesap kökü taranamadı, company={}, customer={}, errorType={}, "
                                + "httpStatus={}, providerCode={}, providerRequestId={}",
                        companyId,
                        rootCustomerId,
                        exception.getClass().getSimpleName(),
                        providerError.httpStatus(),
                        providerError.providerCode(),
                        providerError.requestId());
                addWarning(warnings);
            }
        }

        List<GoogleAdsAccountOption> sortedOptions = options.values().stream()
                .sorted(Comparator.comparing(
                                GoogleAdsAccountOption::descriptiveName,
                                String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(GoogleAdsAccountOption::customerId))
                .limit(MAX_OPTIONS)
                .toList();
        return new GoogleAdsAccountListResponse(sortedOptions, List.copyOf(warnings));
    }

    private void discoverManagerChildren(
            String accessToken,
            CustomerDescriptor root,
            Map<String, GoogleAdsAccountOption> options,
            List<String> warnings,
            UUID companyId) {
        ArrayDeque<CustomerDescriptor> managers = new ArrayDeque<>();
        Set<String> visitedManagers = new HashSet<>();
        managers.add(root);

        while (!managers.isEmpty()
                && visitedManagers.size() < MAX_MANAGER_ACCOUNTS
                && options.size() < MAX_OPTIONS) {
            CustomerDescriptor manager = managers.removeFirst();
            if (!visitedManagers.add(manager.customerId())) {
                continue;
            }
            try {
                for (CustomerDescriptor child : client.fetchDirectChildren(
                        accessToken, manager.customerId(), root.customerId())) {
                    if (options.size() >= MAX_OPTIONS) {
                        break;
                    }
                    if (!isEnabled(child)) {
                        continue;
                    }
                    if (child.manager()) {
                        if (!visitedManagers.contains(child.customerId())
                                && visitedManagers.size() + managers.size() < MAX_MANAGER_ACCOUNTS) {
                            managers.addLast(child);
                        }
                    } else {
                        options.putIfAbsent(child.customerId(), managerOption(child, root));
                    }
                }
            } catch (Exception exception) {
                ProviderError providerError = providerErrorParser.parse(exception);
                log.warn("Google Ads yönetici dalı taranamadı, company={}, customer={}, errorType={}, "
                                + "httpStatus={}, providerCode={}, providerRequestId={}",
                        companyId,
                        manager.customerId(),
                        exception.getClass().getSimpleName(),
                        providerError.httpStatus(),
                        providerError.providerCode(),
                        providerError.requestId());
                addWarning(warnings);
            }
        }
    }

    private boolean isEnabled(CustomerDescriptor customer) {
        return customer != null && "ENABLED".equalsIgnoreCase(customer.status());
    }

    private GoogleAdsAccountOption directOption(CustomerDescriptor customer) {
        return new GoogleAdsAccountOption(
                customer.customerId(),
                customer.descriptiveName(),
                customer.customerId(),
                "DIRECT",
                null,
                customer.status());
    }

    private GoogleAdsAccountOption managerOption(
            CustomerDescriptor customer,
            CustomerDescriptor rootManager) {
        return new GoogleAdsAccountOption(
                customer.customerId(),
                customer.descriptiveName(),
                rootManager.customerId(),
                "MANAGER",
                rootManager.descriptiveName(),
                customer.status());
    }

    private void addWarning(List<String> warnings) {
        if (warnings.isEmpty()) {
            warnings.add("Bazı Google Ads hesapları taranamadı; doğrulanabilen hesaplar gösteriliyor.");
        }
    }
}
