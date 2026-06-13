package com.fogistanbul.crm.user.infrastructure;

import com.fogistanbul.crm.entity.UserProfile;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class UserAccountCleanupRepository {

    static final List<String> DELETE_QUERIES = List.of(
            "DELETE FROM activity_logs WHERE user_id = :uid",
            "DELETE FROM approval_requests WHERE requested_by = :uid",
            "DELETE FROM company_memberships WHERE user_id = :uid",
            "DELETE FROM company_permissions WHERE user_id = :uid",
            "DELETE FROM message_read_receipts WHERE user_id = :uid",
            "DELETE FROM messages WHERE sender_id = :uid",
            "DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE user1_id = :uid OR user2_id = :uid)",
            "DELETE FROM conversations WHERE user1_id = :uid OR user2_id = :uid",
            "DELETE FROM messages_threads WHERE created_by = :uid",
            "DELETE FROM file_attachments WHERE uploaded_by = :uid",
            "DELETE FROM group_message_reads WHERE user_id = :uid",
            "DELETE FROM group_members WHERE user_id = :uid",
            "DELETE FROM group_messages WHERE sender_id = :uid",
            "DELETE FROM meeting_participants WHERE user_id = :uid",
            "DELETE FROM notes WHERE user_id = :uid",
            "DELETE FROM notification_preferences WHERE user_id = :uid",
            "DELETE FROM notifications WHERE user_id = :uid",
            "DELETE FROM pr_project_members WHERE user_id = :uid",
            "DELETE FROM refresh_tokens WHERE user_id = :uid",
            "DELETE FROM satisfaction_surveys WHERE submitted_by = :uid",
            "DELETE FROM shoot_participants WHERE user_id = :uid",
            "DELETE FROM task_notes WHERE author_id = :uid",
            "DELETE FROM task_reviews WHERE reviewer_id = :uid",
            "DELETE FROM time_entries WHERE user_id = :uid",
            "DELETE FROM google_oauth_tokens WHERE user_id = :uid",
            "DELETE FROM pr_phase_notes WHERE author_id = :uid",
            "DELETE FROM routine_completions WHERE user_id = :uid",
            "DELETE FROM routine_tasks WHERE created_by_id = :uid",
            "DELETE FROM content_plans WHERE created_by = :uid",
            "DELETE FROM tasks WHERE assigned_to = :uid"
    );

    static final List<String> NULLIFY_QUERIES = List.of(
            "UPDATE approval_requests SET reviewed_by = NULL WHERE reviewed_by = :uid",
            "UPDATE meetings SET created_by = NULL WHERE created_by = :uid",
            "UPDATE pr_projects SET created_by = NULL WHERE created_by = :uid",
            "UPDATE pr_projects SET responsible_id = NULL WHERE responsible_id = :uid",
            "UPDATE pr_project_phases SET assigned_to_id = NULL WHERE assigned_to_id = :uid",
            "UPDATE shoots SET created_by = NULL WHERE created_by = :uid",
            "UPDATE shoots SET photographer_id = NULL WHERE photographer_id = :uid",
            "UPDATE tasks SET created_by = NULL WHERE created_by = :uid",
            "UPDATE routine_tasks SET assigned_to_id = NULL WHERE assigned_to_id = :uid",
            "UPDATE messages_threads SET created_by = NULL WHERE created_by = :uid"
    );

    private final EntityManager entityManager;

    public void deleteReferences(UserProfile user) {
        UUID userId = user.getId();
        DELETE_QUERIES.forEach(query -> execute(query, userId));
        NULLIFY_QUERIES.forEach(query -> execute(query, userId));
        entityManager.flush();

        if (user.getPerson() != null) {
            entityManager.createNativeQuery("DELETE FROM persons WHERE id = :pid")
                    .setParameter("pid", user.getPerson().getId())
                    .executeUpdate();
        }
    }

    private void execute(String sql, UUID userId) {
        entityManager.createNativeQuery(sql)
                .setParameter("uid", userId)
                .executeUpdate();
    }
}
