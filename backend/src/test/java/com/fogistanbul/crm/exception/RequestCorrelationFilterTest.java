package com.fogistanbul.crm.exception;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class RequestCorrelationFilterTest {

    private final RequestCorrelationFilter filter = new RequestCorrelationFilter();

    @Test
    void existingRequestIdIsPreservedInRequestAndResponse() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/test");
        request.addHeader(RequestCorrelationFilter.REQUEST_ID_HEADER, "trace-123");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertEquals("trace-123", request.getAttribute(RequestCorrelationFilter.REQUEST_ID_ATTRIBUTE));
        assertEquals("trace-123", response.getHeader(RequestCorrelationFilter.REQUEST_ID_HEADER));
    }

    @Test
    void missingRequestIdIsGenerated() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/test");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertNotNull(request.getAttribute(RequestCorrelationFilter.REQUEST_ID_ATTRIBUTE));
        assertNotNull(response.getHeader(RequestCorrelationFilter.REQUEST_ID_HEADER));
    }

    @Test
    void unsafeRequestIdIsReplaced() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/test");
        request.addHeader(RequestCorrelationFilter.REQUEST_ID_HEADER, "bad id\ninjected");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        String requestId = response.getHeader(RequestCorrelationFilter.REQUEST_ID_HEADER);
        assertNotNull(requestId);
        org.junit.jupiter.api.Assertions.assertNotEquals("bad id\ninjected", requestId);
    }
}
