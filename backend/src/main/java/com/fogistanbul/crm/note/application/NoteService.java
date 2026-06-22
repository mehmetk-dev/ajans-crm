package com.fogistanbul.crm.note.application;

import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.note.domain.Note;
import com.fogistanbul.crm.note.dto.CreateNoteRequest;
import com.fogistanbul.crm.note.dto.NoteResponse;
import com.fogistanbul.crm.note.infrastructure.NoteRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NoteService {

    private final NoteRepository noteRepository;
    private final UserProfileRepository userProfileRepository;
    private final CompanyRepository companyRepository;
    private final NoteAccessPolicy accessPolicy;
    private final NoteMapper mapper;

    @Transactional
    public NoteResponse createNote(CreateNoteRequest request, UUID userId) {
        UserProfile user = getUser(userId);
        Note note = Note.builder()
                .user(user)
                .content(request.getContent().trim())
                .build();

        if (request.getCompanyId() != null) {
            accessPolicy.requireCompanyAccess(user, request.getCompanyId());
            Company company = companyRepository.findById(request.getCompanyId())
                    .orElseThrow(() -> new RuntimeException("Şirket bulunamadı"));
            note.setCompany(company);
        }

        Note savedNote = noteRepository.save(note);
        log.info("Note created by user {}", user.getEmail());
        return mapper.toResponse(savedNote);
    }

    @Transactional(readOnly = true)
    public Page<NoteResponse> getMyNotes(UUID userId, UUID companyId, Pageable pageable) {
        Page<Note> notes = companyId == null
                ? noteRepository.findByUserId(userId, pageable)
                : noteRepository.findByUserIdAndCompanyId(userId, companyId, pageable);
        return notes.map(mapper::toResponse);
    }

    @Transactional
    public NoteResponse toggleNote(UUID noteId, UUID userId) {
        Note note = getNote(noteId);
        accessPolicy.requireOwner(note, userId);
        note.setIsOpen(!Boolean.TRUE.equals(note.getIsOpen()));
        return mapper.toResponse(noteRepository.save(note));
    }

    @Transactional
    public void deleteNote(UUID noteId, UUID userId) {
        Note note = getNote(noteId);
        accessPolicy.requireOwner(note, userId);
        noteRepository.delete(note);
    }

    private UserProfile getUser(UUID userId) {
        return userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
    }

    private Note getNote(UUID noteId) {
        return noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Not bulunamadı"));
    }
}
