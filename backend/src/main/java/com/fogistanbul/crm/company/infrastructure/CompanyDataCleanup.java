package com.fogistanbul.crm.company.infrastructure;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CompanyDataCleanup {

    private static final List<String> USER_REFERENCES = List.of(
            "UPDATE tasks SET assigned_to = NULL WHERE assigned_to = :uid",
            "UPDATE tasks SET created_by = NULL WHERE created_by = :uid",
            "DELETE FROM task_reviews WHERE reviewer_id = :uid",
            "DELETE FROM time_entries WHERE user_id = :uid",
            "DELETE FROM notifications WHERE user_id = :uid",
            "DELETE FROM notification_preferences WHERE user_id = :uid",
            "DELETE FROM company_permissions WHERE user_id = :uid",
            "DELETE FROM activity_logs WHERE user_id = :uid",
            "DELETE FROM refresh_tokens WHERE user_id = :uid",
            "DELETE FROM group_message_reads WHERE user_id = :uid",
            "DELETE FROM group_members WHERE user_id = :uid",
            "DELETE FROM group_messages WHERE sender_id = :uid",
            "DELETE FROM message_read_receipts WHERE user_id = :uid",
            "DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE user1_id = :uid OR user2_id = :uid)",
            "DELETE FROM messages WHERE sender_id = :uid",
            "DELETE FROM conversations WHERE user1_id = :uid OR user2_id = :uid",
            "DELETE FROM messages_threads WHERE created_by = :uid",
            "DELETE FROM file_attachments WHERE uploaded_by = :uid",
            "DELETE FROM notes WHERE user_id = :uid",
            "DELETE FROM meeting_participants WHERE user_id = :uid",
            "UPDATE meetings SET created_by = NULL WHERE created_by = :uid",
            "DELETE FROM shoot_participants WHERE user_id = :uid",
            "UPDATE shoots SET created_by = NULL WHERE created_by = :uid",
            "DELETE FROM pr_project_members WHERE user_id = :uid",
            "UPDATE pr_projects SET created_by = NULL WHERE created_by = :uid",
            "DELETE FROM approval_requests WHERE requester_id = :uid OR approver_id = :uid",
            "DELETE FROM satisfaction_surveys WHERE submitted_by = :uid",
            "DELETE FROM company_memberships WHERE user_id = :uid"
    );

    private static final List<String> COMPANY_REFERENCES = List.of(
            "DELETE FROM task_reviews WHERE task_id IN (SELECT id FROM tasks WHERE company_id = :cid)",
            "DELETE FROM time_entries WHERE task_id IN (SELECT id FROM tasks WHERE company_id = :cid)",
            "DELETE FROM tasks WHERE company_id = :cid",
            "DELETE FROM time_entries WHERE company_id = :cid",
            "DELETE FROM shoot_participants WHERE shoot_id IN (SELECT id FROM shoots WHERE company_id = :cid)",
            "DELETE FROM shoots WHERE company_id = :cid",
            "DELETE FROM meeting_participants WHERE meeting_id IN (SELECT id FROM meetings WHERE company_id = :cid)",
            "DELETE FROM meetings WHERE company_id = :cid",
            "DELETE FROM pr_project_phases WHERE project_id IN (SELECT id FROM pr_projects WHERE company_id = :cid)",
            "DELETE FROM pr_project_members WHERE project_id IN (SELECT id FROM pr_projects WHERE company_id = :cid)",
            "DELETE FROM pr_projects WHERE company_id = :cid",
            "DELETE FROM group_message_reads WHERE message_id IN (SELECT id FROM group_messages WHERE group_id IN (SELECT id FROM group_conversations WHERE company_id = :cid))",
            "DELETE FROM group_messages WHERE group_id IN (SELECT id FROM group_conversations WHERE company_id = :cid)",
            "DELETE FROM group_members WHERE group_id IN (SELECT id FROM group_conversations WHERE company_id = :cid)",
            "DELETE FROM group_conversations WHERE company_id = :cid",
            "DELETE FROM notes WHERE company_id = :cid",
            "DELETE FROM messages_threads WHERE company_id = :cid",
            "DELETE FROM approval_requests WHERE company_id = :cid",
            "DELETE FROM company_permissions WHERE company_id = :cid",
            "DELETE FROM satisfaction_surveys WHERE company_id = :cid",
            "DELETE FROM google_oauth_tokens WHERE company_id = :cid",
            "DELETE FROM persons WHERE company_id = :cid"
    );

    private final EntityManager entityManager;

    public void cleanUserReferences(UUID userId) {
        execute(USER_REFERENCES, "uid", userId);
    }

    public void deleteCompanyData(UUID companyId, List<UUID> companyUserIds) {
        execute(COMPANY_REFERENCES, "cid", companyId);
        companyUserIds.forEach(userId ->
                execute(List.of("DELETE FROM user_profiles WHERE id = :uid"), "uid", userId));
        execute(List.of("DELETE FROM companies WHERE id = :cid"), "cid", companyId);
        entityManager.flush();
        entityManager.clear();
    }

    private void execute(List<String> statements, String parameterName, UUID value) {
        statements.forEach(statement -> entityManager.createNativeQuery(statement)
                .setParameter(parameterName, value)
                .executeUpdate());
    }
}
