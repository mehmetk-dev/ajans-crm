package com.fogistanbul.crm.company.infrastructure;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CompanyDataCleanupTest {

    @Test
    void cleanupUsesTheCurrentApprovalSchema() throws Exception {
        List<String> userReferences = queryList("USER_REFERENCES");

        assertTrue(userReferences.contains(
                "DELETE FROM approval_requests WHERE requested_by = :uid"
        ));
        assertTrue(userReferences.contains(
                "UPDATE approval_requests SET reviewed_by = NULL WHERE reviewed_by = :uid"
        ));
        assertFalse(userReferences.stream()
                .anyMatch(query -> query.contains("requester_id") || query.contains("approver_id")));
    }

    @SuppressWarnings("unchecked")
    private static List<String> queryList(String fieldName) throws Exception {
        Field field = CompanyDataCleanup.class.getDeclaredField(fieldName);
        field.setAccessible(true);
        return (List<String>) field.get(null);
    }
}
