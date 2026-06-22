package com.fogistanbul.crm.webdesign.application;

import com.fogistanbul.crm.webdesign.domain.PageSpeedSnapshot;
import com.fogistanbul.crm.webdesign.dto.PageSpeedScoreResponse;
import org.springframework.stereotype.Component;

@Component
public class PageSpeedMapper {

    public PageSpeedScoreResponse toScoreResponse(PageSpeedSnapshot snapshot) {
        return PageSpeedScoreResponse.builder()
                .strategy(snapshot.getStrategy())
                .testedUrl(snapshot.getTestedUrl())
                .performance(snapshot.getPerformance())
                .accessibility(snapshot.getAccessibility())
                .bestPractices(snapshot.getBestPractices())
                .seo(snapshot.getSeo())
                .lcpMs(snapshot.getLcpMs())
                .fidMs(snapshot.getFidMs())
                .clsValue(snapshot.getClsValue())
                .tbtMs(snapshot.getTbtMs())
                .fcpMs(snapshot.getFcpMs())
                .fetchedAt(snapshot.getFetchedAt())
                .fetchError(toDisplayFetchError(snapshot.getFetchError()))
                .build();
    }

    private String toDisplayFetchError(String error) {
        if (error == null) return null;
        if (error.contains("FAILED_DOCUMENT_REQUEST")) {
            return "Google PageSpeed siteyi yükleyemedi. Site tarayıcıda açılsa bile Google Lighthouse tarafından engelleniyor, çok yavaş yanıt veriyor veya bot/güvenlik kurallarına takılıyor olabilir.";
        }
        if (error.contains("API key not valid")) {
            return "PAGESPEED_API_KEY geçersiz görünüyor.";
        }
        if (error.toLowerCase().contains("quota") || error.contains("429")) {
            return "PageSpeed API kotasi dolmus olabilir. Bir sure sonra tekrar deneyin.";
        }
        return error;
    }
}
