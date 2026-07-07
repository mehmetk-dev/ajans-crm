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
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class InstagramInsightFetcherTest {

    @Mock
    InstagramGraphClient client;

    InstagramInsightFetcher fetcher;

    @BeforeEach
    void setUp() {
        fetcher = new InstagramInsightFetcher(
                client,
                new InstagramInsightParser(),
                new InstagramDateRangeResolver());
    }

    @Test
    void fetchDailyTotalInsightByDate_skipsViewsBecauseMetaRequiresTotalValueMetricType() {
        var result = fetcher.fetchDailyTotalInsightByDate(
                "ig-1",
                "token",
                "views",
                List.of(Map.of("end_time", "2026-07-07T00:00:00+0000", "value", 12)));

        assertThat(result).isEmpty();
        verifyNoInteractions(client);
    }
}
