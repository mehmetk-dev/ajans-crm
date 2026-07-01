package com.fogistanbul.crm.instagram.application;

final class InstagramGraphErrorClassifier {

    private InstagramGraphErrorClassifier() {
    }

    static boolean isInvalidAccessToken(Exception exception) {
        String message = exception.getMessage() != null ? exception.getMessage() : "";
        String lower = message.toLowerCase();
        return message.contains("\"code\":190")
                || lower.contains("invalid oauth access token")
                || lower.contains("error validating access token")
                || lower.contains("session has expired")
                || lower.contains("access token has expired");
    }
}
