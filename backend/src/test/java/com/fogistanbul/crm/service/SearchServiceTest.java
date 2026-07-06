package com.fogistanbul.crm.service;

import com.fogistanbul.crm.dto.SearchResponse;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.Task;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.CompanyKind;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.entity.enums.TaskStatus;
import com.fogistanbul.crm.note.infrastructure.NoteRepository;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.TaskRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SearchServiceTest {

    @Mock CompanyRepository companyRepository;
    @Mock TaskRepository taskRepository;
    @Mock UserProfileRepository userProfileRepository;
    @Mock NoteRepository noteRepository;
    @Mock CompanyMembershipRepository membershipRepository;

    @InjectMocks SearchService searchService;

    @Test
    void search_admin_companyLessTask_doesNotThrow_andUsesAjansIciSubtitle() {
        Task internalTask = task("alpha query", null);
        when(taskRepository.findAll()).thenReturn(List.of(internalTask));
        when(companyRepository.findByKind(CompanyKind.CLIENT)).thenReturn(List.of());
        when(userProfileRepository.findAll()).thenReturn(List.of());
        when(noteRepository.findAll()).thenReturn(List.of());

        UUID userId = UUID.randomUUID();

        SearchResponse response = assertDoesNotThrow(
                () -> searchService.search("alpha", userId, "ADMIN"));

        assertFalse(response.getTasks().isEmpty());
        assertEquals("Ajans İçi - TODO", response.getTasks().get(0).getSubtitle());
    }

    @Test
    void search_admin_companyTask_usesCompanyNameInSubtitle() {
        Company company = company("Acme", CompanyKind.CLIENT);
        Task task = task("alpha query", company);

        when(taskRepository.findAll()).thenReturn(List.of(task));
        when(companyRepository.findByKind(CompanyKind.CLIENT)).thenReturn(List.of());
        when(userProfileRepository.findAll()).thenReturn(List.of());
        when(noteRepository.findAll()).thenReturn(List.of());

        SearchResponse response = searchService.search("alpha", UUID.randomUUID(), "ADMIN");

        assertFalse(response.getTasks().isEmpty());
        assertEquals("Acme - TODO", response.getTasks().get(0).getSubtitle());
    }

    private Task task(String title, Company company) {
        UserProfile assignee = new UserProfile();
        assignee.setId(UUID.randomUUID());
        UserProfile creator = new UserProfile();
        creator.setId(UUID.randomUUID());
        return Task.builder()
                .id(UUID.randomUUID())
                .title(title)
                .company(company)
                .assignedTo(assignee)
                .createdBy(creator)
                .status(TaskStatus.TODO)
                .build();
    }

    private Company company(String name, CompanyKind kind) {
        Company c = new Company();
        c.setId(UUID.randomUUID());
        c.setName(name);
        c.setKind(kind);
        return c;
    }
}
