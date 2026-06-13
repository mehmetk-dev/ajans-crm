package com.fogistanbul.crm.user.infrastructure;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class UserAccountCleanupRepositoryTest {

    @Test
    void cleanupUsesTheCurrentApprovalSchema() {
        assertTrue(UserAccountCleanupRepository.DELETE_QUERIES.contains(
                "DELETE FROM approval_requests WHERE requested_by = :uid"
        ));
        assertTrue(UserAccountCleanupRepository.NULLIFY_QUERIES.contains(
                "UPDATE approval_requests SET reviewed_by = NULL WHERE reviewed_by = :uid"
        ));
        assertFalse(UserAccountCleanupRepository.DELETE_QUERIES.stream()
                .anyMatch(query -> query.contains("requester_id") || query.contains("approver_id")));
    }

    @Test
    void cleanupCoversRequiredCreatorAndAssigneeReferences() {
        assertTrue(UserAccountCleanupRepository.DELETE_QUERIES.contains(
                "DELETE FROM content_plans WHERE created_by = :uid"
        ));
        assertTrue(UserAccountCleanupRepository.DELETE_QUERIES.contains(
                "DELETE FROM routine_tasks WHERE created_by_id = :uid"
        ));
        assertTrue(UserAccountCleanupRepository.DELETE_QUERIES.contains(
                "DELETE FROM tasks WHERE assigned_to = :uid"
        ));
        assertTrue(UserAccountCleanupRepository.NULLIFY_QUERIES.contains(
                "UPDATE pr_project_phases SET assigned_to_id = NULL WHERE assigned_to_id = :uid"
        ));
        assertTrue(UserAccountCleanupRepository.NULLIFY_QUERIES.contains(
                "UPDATE shoots SET photographer_id = NULL WHERE photographer_id = :uid"
        ));
    }
}
