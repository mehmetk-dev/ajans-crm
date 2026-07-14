package com.fogistanbul.crm.instagram.application;

import com.fogistanbul.crm.instagram.infrastructure.InstagramGraphClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InstagramMediaInsightServiceTest {

    @Mock
    InstagramGraphClient client;

    InstagramMediaInsightService service;

    @BeforeEach
    void setUp() {
        service = new InstagramMediaInsightService(client, new InstagramInsightParser());
    }

    @Test
    void reelInsights_fallsBackToSingleMetricsWhenBatchRequestFails() {
        when(client.get("/media-1/insights", "token", Map.of(
                "metric", "views,reach,saved,shares")))
                .thenThrow(new RuntimeException("unsupported metric"));
        when(client.get("/media-1/insights", "token", Map.of("metric", "views")))
                .thenReturn(Map.of("data", List.of(Map.of(
                        "name", "views",
                        "values", List.of(Map.of("value", 321))))));

        var result = service.reelInsights("media-1", "token");

        assertThat(result.views()).isEqualTo(321);
    }

    @Test
    void postInsights_usesCurrentViewsMetricInsteadOfLegacyImpressionsBatch() {
        when(client.get("/post-1/insights", "token", Map.of(
                "metric", "views,reach,saved,shares")))
                .thenReturn(Map.of("data", List.of(Map.of(
                        "name", "views",
                        "values", List.of(Map.of("value", 654))))));

        var result = service.postInsights("post-1", "token");

        assertThat(result.impressions()).isEqualTo(654);
    }
}
