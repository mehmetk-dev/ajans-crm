package com.fogistanbul.crm.note.application;

import com.fogistanbul.crm.company.application.CompanyAccessPolicy;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.note.domain.Note;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NoteAccessPolicyTest {

    @Mock
    private CompanyMembershipRepository membershipRepository;

    @Test
    void adminCanLinkNoteWithoutMembership() {
        NoteAccessPolicy policy = policy();
        UserProfile admin = user(GlobalRole.ADMIN);

        assertDoesNotThrow(() -> policy.requireCompanyAccess(admin, UUID.randomUUID()));
        verifyNoInteractions(membershipRepository);
    }

    @Test
    void staffNeedsCompanyMembership() {
        NoteAccessPolicy policy = policy();
        UserProfile staff = user(GlobalRole.AGENCY_STAFF);
        UUID companyId = UUID.randomUUID();
        when(membershipRepository.existsByUserIdAndCompanyId(staff.getId(), companyId)).thenReturn(false);

        assertThrows(AccessDeniedException.class, () -> policy.requireCompanyAccess(staff, companyId));
    }

    @Test
    void onlyOwnerCanChangeNote() {
        NoteAccessPolicy policy = policy();
        Note note = Note.builder().user(user(GlobalRole.AGENCY_STAFF)).build();

        assertThrows(AccessDeniedException.class, () -> policy.requireOwner(note, UUID.randomUUID()));
        assertDoesNotThrow(() -> policy.requireOwner(note, note.getUser().getId()));
    }

    private UserProfile user(GlobalRole role) {
        return UserProfile.builder()
                .id(UUID.randomUUID())
                .globalRole(role)
                .email("user@example.com")
                .passwordHash("hash")
                .build();
    }

    private NoteAccessPolicy policy() {
        return new NoteAccessPolicy(new CompanyAccessPolicy(membershipRepository));
    }
}
