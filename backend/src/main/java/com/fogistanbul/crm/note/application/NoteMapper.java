package com.fogistanbul.crm.note.application;

import com.fogistanbul.crm.note.domain.Note;
import com.fogistanbul.crm.note.dto.NoteResponse;
import org.springframework.stereotype.Component;

@Component
public class NoteMapper {

    public NoteResponse toResponse(Note note) {
        return NoteResponse.builder()
                .id(note.getId())
                .userId(note.getUser().getId())
                .userName(note.getUser().getPerson() != null
                        ? note.getUser().getPerson().getFullName()
                        : note.getUser().getEmail())
                .userAvatarUrl(note.getUser().getPerson() != null
                        ? note.getUser().getPerson().getAvatarUrl()
                        : null)
                .companyId(note.getCompany() != null ? note.getCompany().getId() : null)
                .companyName(note.getCompany() != null ? note.getCompany().getName() : null)
                .content(note.getContent())
                .isOpen(note.getIsOpen())
                .noteDate(note.getNoteDate())
                .createdAt(note.getCreatedAt())
                .build();
    }
}
