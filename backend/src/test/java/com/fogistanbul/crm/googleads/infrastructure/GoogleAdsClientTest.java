package com.fogistanbul.crm.googleads.infrastructure;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class GoogleAdsClientTest {

    private GoogleAdsClient client;
    private MockRestServiceServer server;

    @BeforeEach
    void setUp() {
        RestTemplate restTemplate = new RestTemplate();
        server = MockRestServiceServer.bindTo(restTemplate).build();
        client = new GoogleAdsClient(restTemplate);
        ReflectionTestUtils.setField(client, "developerToken", "developer-token");
        ReflectionTestUtils.setField(client, "managerCustomerId", "1234567890");
    }

    @Test
    void searchFollowsGoogleAdsNextPageToken() {
        server.expect(method(POST))
                .andExpect(jsonPath("$.pageToken").doesNotExist())
                .andRespond(withSuccess("""
                        {"results":[{"segments":{"date":"2026-07-13"},"metrics":{"costMicros":"1000000","clicks":"1","impressions":"10"}}],"nextPageToken":"next-1"}
                        """, APPLICATION_JSON));
        server.expect(method(POST))
                .andExpect(jsonPath("$.pageToken").value("next-1"))
                .andRespond(withSuccess("""
                        {"results":[{"segments":{"date":"2026-07-14"},"metrics":{"costMicros":"2000000","clicks":"2","impressions":"20"}}]}
                        """, APPLICATION_JSON));

        var rows = client.fetchDailyTrend("access", "9876543210", "2026-07-13", "2026-07-14");

        assertThat(rows).hasSize(2);
        server.verify();
    }

    @Test
    void recognizesConfiguredManagerCustomerIdAfterNormalization() {
        assertThat(client.isManagerCustomerId("123-456-7890")).isTrue();
        assertThat(client.isManagerCustomerId("987-654-3210")).isFalse();
    }
}
