package com.fogistanbul.crm.note.application;

import com.fogistanbul.crm.entity.Person;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.note.domain.Note;
import com.fogistanbul.crm.note.dto.CreateNoteRequest;
import com.fogistanbul.crm.note.dto.NoteResponse;
import com.fogistanbul.crm.note.infrastructure.NoteRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NoteServiceTest {

    @Mock
    private NoteRepository noteRepository;
    @Mock
    private UserProfileRepository userProfileRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private NoteAccessPolicy accessPolicy;

    private NoteService noteService;

    @BeforeEach
    void setUp() {
        noteService = new NoteService(
                noteRepository,
                userProfileRepository,
                companyRepository,
                accessPolicy,
                new NoteMapper()
        );
    }

    @Test
    void createNoteTrimsContentAndMapsResponse() {
        UserProfile user = user();
        CreateNoteRequest request = new CreateNoteRequest();
        request.setContent("  Pilot not  ");
        when(userProfileRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(noteRepository.save(any(Note.class))).thenAnswer(invocation -> {
            Note note = invocation.getArgument(0);
            note.setId(UUID.randomUUID());
            note.setNoteDate(LocalDate.now());
            note.setCreatedAt(Instant.now());
            return note;
        });

        NoteResponse response = noteService.createNote(request, user.getId());

        assertEquals("Pilot not", response.getContent());
        assertEquals("Test User", response.getUserName());
    }

    @Test
    void listUsesCompanyFilterWhenProvided() {
        UserProfile user = user();
        UUID companyId = UUID.randomUUID();
        PageRequest pageable = PageRequest.of(0, 20);
        when(noteRepository.findByUserIdAndCompanyId(user.getId(), companyId, pageable))
                .thenReturn(new PageImpl<>(List.of()));

        noteService.getMyNotes(user.getId(), companyId, pageable);

        verify(noteRepository).findByUserIdAndCompanyId(user.getId(), companyId, pageable);
    }

    @Test
    void toggleClosesOpenNote() {
        UserProfile user = user();
        Note note = Note.builder()
                .id(UUID.randomUUID())
                .user(user)
                .content("Not")
                .isOpen(true)
                .noteDate(LocalDate.now())
                .createdAt(Instant.now())
                .build();
        when(noteRepository.findById(note.getId())).thenReturn(Optional.of(note));
        when(noteRepository.save(note)).thenReturn(note);

        NoteResponse response = noteService.toggleNote(note.getId(), user.getId());

        assertFalse(response.getIsOpen());
        verify(accessPolicy).requireOwner(note, user.getId());
    }

    private UserProfile user() {
        return UserProfile.builder()
                .id(UUID.randomUUID())
                .globalRole(GlobalRole.AGENCY_STAFF)
                .email("staff@example.com")
                .passwordHash("hash")
                .person(Person.builder().fullName("Test User").build())
                .build();
    }
}
