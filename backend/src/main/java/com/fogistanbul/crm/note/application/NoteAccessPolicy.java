package com.fogistanbul.crm.note.application;

import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.note.domain.Note;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class NoteAccessPolicy {

    private final CompanyMembershipRepository membershipRepository;

    public void requireCompanyAccess(UserProfile user, UUID companyId) {
        if (user.getGlobalRole() == GlobalRole.ADMIN) {
            return;
        }
        if (!membershipRepository.existsByUserIdAndCompanyId(user.getId(), companyId)) {
            throw new AccessDeniedException("Bu sirketle not baglama yetkiniz yok");
        }
    }

    public void requireOwner(Note note, UUID userId) {
        if (!note.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Bu notu degistirme yetkiniz yok");
        }
    }
}
