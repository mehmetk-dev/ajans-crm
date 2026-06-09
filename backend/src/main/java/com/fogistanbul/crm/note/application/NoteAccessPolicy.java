package com.fogistanbul.crm.note.application;

import com.fogistanbul.crm.company.application.CompanyAccessPolicy;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.note.domain.Note;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class NoteAccessPolicy {

    private final CompanyAccessPolicy companyAccessPolicy;

    public void requireCompanyAccess(UserProfile user, UUID companyId) {
        companyAccessPolicy.requireAccess(user, companyId);
    }

    public void requireOwner(Note note, UUID userId) {
        if (!note.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Bu notu degistirme yetkiniz yok");
        }
    }
}
