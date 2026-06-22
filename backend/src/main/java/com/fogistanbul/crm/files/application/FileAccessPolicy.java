package com.fogistanbul.crm.files.application;

import com.fogistanbul.crm.exception.ApiException;
import com.fogistanbul.crm.entity.Message;
import com.fogistanbul.crm.entity.Task;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.note.domain.Note;
import com.fogistanbul.crm.note.infrastructure.NoteRepository;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.MessageRepository;
import com.fogistanbul.crm.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class FileAccessPolicy {

    private final TaskRepository taskRepository;
    private final NoteRepository noteRepository;
    private final MessageRepository messageRepository;
    private final CompanyRepository companyRepository;
    private final CompanyMembershipRepository membershipRepository;

    public void requireEntityAccess(String entityType, UUID entityId, UserProfile user) {
        if (user.getGlobalRole() == GlobalRole.ADMIN) {
            return;
        }
        switch (entityType) {
            case "TASK" -> {
                Task task = taskRepository.findById(entityId)
                        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "TASK_NOT_FOUND", "Görev bulunamadı"));
                requireMembership(user.getId(), task.getCompany().getId());
            }
            case "NOTE" -> {
                Note note = noteRepository.findById(entityId)
                        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOTE_NOT_FOUND", "Not bulunamadı"));
                boolean ownNote = note.getUser() != null && note.getUser().getId().equals(user.getId());
                boolean companyScoped = note.getCompany() != null
                        && membershipRepository.existsByUserIdAndCompanyId(user.getId(), note.getCompany().getId());
                if (!ownNote && !companyScoped) {
                    throw new AccessDeniedException("Bu nota erişim yetkiniz yok");
                }
            }
            case "MESSAGE" -> {
                Message message = messageRepository.findById(entityId)
                        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "MESSAGE_NOT_FOUND", "Mesaj bulunamadı"));
                boolean participant = message.getConversation().getUser1().getId().equals(user.getId())
                        || message.getConversation().getUser2().getId().equals(user.getId());
                if (!participant) {
                    throw new AccessDeniedException("Bu mesaja erişim yetkiniz yok");
                }
            }
            case "COMPANY" -> {
                companyRepository.findById(entityId)
                        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "COMPANY_NOT_FOUND", "Şirket bulunamadı"));
                requireMembership(user.getId(), entityId);
            }
            default -> throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_ENTITY_TYPE", "Geçersiz entity type");
        }
    }

    public void requireCompanyAccess(UserProfile user, UUID companyId) {
        if (user.getGlobalRole() == GlobalRole.ADMIN) {
            return;
        }
        requireMembership(user.getId(), companyId);
    }

    public void requireDeleteAccess(UserProfile user, UUID uploadedById) {
        if (user.getGlobalRole() == GlobalRole.ADMIN) {
            return;
        }
        if (!user.getId().equals(uploadedById)) {
            throw new AccessDeniedException("Bu dosyayı silme yetkiniz yok");
        }
    }

    public List<UUID> accessibleCompanyIds(UUID userId) {
        return membershipRepository.findCompanyIdsByUserId(userId);
    }

    private void requireMembership(UUID userId, UUID companyId) {
        if (!membershipRepository.existsByUserIdAndCompanyId(userId, companyId)) {
            throw new AccessDeniedException("Bu şirket verilerine erişim yetkiniz yok");
        }
    }
}
