package com.fogistanbul.crm.googleoauth.application;

import java.util.Map;

public final class GoogleServiceRegistry {

    public static final String SVC_ANALYTICS = "ANALYTICS";
    public static final String SVC_SEARCH_CONSOLE = "SEARCH_CONSOLE";
    public static final String SVC_GOOGLE_ADS = "GOOGLE_ADS";

    private static final Map<String, String> SCOPE_MAP = Map.of(
            SVC_ANALYTICS, "https://www.googleapis.com/auth/analytics.readonly",
            SVC_SEARCH_CONSOLE, "https://www.googleapis.com/auth/webmasters.readonly",
            SVC_GOOGLE_ADS, "https://www.googleapis.com/auth/adwords"
    );

    private static final Map<String, String> REDIRECT_MAP = Map.of(
            SVC_ANALYTICS, "/client/google-analytics?connected=true",
            SVC_SEARCH_CONSOLE, "/client/search-console?connected=true",
            SVC_GOOGLE_ADS, "/client/google-ads?connected=true"
    );

    private GoogleServiceRegistry() {}

    public static String scopeFor(String serviceType) {
        return SCOPE_MAP.getOrDefault(serviceType, SCOPE_MAP.get(SVC_ANALYTICS));
    }

    public static String redirectFor(String serviceType) {
        return REDIRECT_MAP.getOrDefault(serviceType, "/client/analytics");
    }
}
