package com.fogistanbul.crm.googleads.infrastructure;

import com.fogistanbul.crm.googleads.dto.GoogleAdsAccessContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.headerDoesNotExist;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
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

        var rows = client.fetchDailyTrend(
                "access",
                new GoogleAdsAccessContext("9876543210", null),
                "2026-07-13",
                "2026-07-14");

        assertThat(rows).hasSize(2);
        server.verify();
    }

    @Test
    void directAccountDoesNotSendLoginCustomerIdHeader() {
        server.expect(method(POST))
                .andExpect(headerDoesNotExist("login-customer-id"))
                .andRespond(withSuccess("{\"results\":[]}", APPLICATION_JSON));

        client.fetchSummary(
                "access",
                new GoogleAdsAccessContext("2994497086", null),
                "2026-07-13",
                "2026-07-14");

        server.verify();
    }

    @Test
    void managerChildAccountSendsSelectedLoginCustomerIdHeader() {
        server.expect(method(POST))
                .andExpect(header("login-customer-id", "8437875152"))
                .andRespond(withSuccess("{\"results\":[]}", APPLICATION_JSON));

        client.fetchSummary(
                "access",
                new GoogleAdsAccessContext("2994497086", "8437875152"),
                "2026-07-13",
                "2026-07-14");

        server.verify();
    }

    @Test
    void listAccessibleCustomersNeverSendsManagerHeader() {
        server.expect(requestTo("https://googleads.googleapis.com/v24/customers:listAccessibleCustomers"))
                .andExpect(method(GET))
                .andExpect(headerDoesNotExist("login-customer-id"))
                .andRespond(withSuccess("""
                        {"resourceNames":["customers/2994497086","customers/8437875152"]}
                        """, APPLICATION_JSON));

        assertThat(client.listAccessibleCustomerIds("access"))
                .containsExactly("2994497086", "8437875152");
        server.verify();
    }

    @Test
    void managerHierarchyQueryUsesRootLoginAndParsesChildren() {
        server.expect(requestTo(
                        "https://googleads.googleapis.com/v24/customers/8437875152/googleAds:search"))
                .andExpect(method(POST))
                .andExpect(header("login-customer-id", "8437875152"))
                .andRespond(withSuccess("""
                        {"results":[
                          {"customerClient":{"clientCustomer":"customers/2994497086","descriptiveName":"Direct Co","manager":false,"status":"ENABLED","level":"1"}},
                          {"customerClient":{"clientCustomer":"customers/1111111111","descriptiveName":"Nested MCC","manager":true,"status":"ENABLED","level":"1"}}
                        ]}
                        """, APPLICATION_JSON));

        var children = client.fetchDirectChildren("access", "8437875152", "8437875152");

        assertThat(children).extracting(GoogleAdsClient.CustomerDescriptor::customerId)
                .containsExactly("2994497086", "1111111111");
        assertThat(children.get(0).manager()).isFalse();
        assertThat(children.get(0).status()).isEqualTo("ENABLED");
        server.verify();
    }
}
