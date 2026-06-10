package com.fogistanbul.crm.task.application;

import com.fogistanbul.crm.entity.Task;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.TaskStatus;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.PrProjectPhaseRepository;
import com.fogistanbul.crm.repository.PrProjectRepository;
import com.fogistanbul.crm.repository.TaskRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.prproject.application.PrProjectProgressService;
import com.fogistanbul.crm.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private UserProfileRepository userProfileRepository;
    @Mock
    private CompanyMembershipRepository membershipRepository;
    @Mock
    private PrProjectPhaseRepository phaseRepository;
    @Mock
    private PrProjectRepository prProjectRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private TaskAccessPolicy accessPolicy;
    @Mock
    private TaskMapper mapper;
    @Mock
    private PrProjectProgressService prProjectProgressService;

    @InjectMocks
    private TaskService taskService;

    @Test
    void clientTaskListUsesAllAccessibleCompanies() {
        UUID userId = UUID.randomUUID();
        UserProfile user = UserProfile.builder().id(userId).build();
        List<UUID> companyIds = List.of(UUID.randomUUID(), UUID.randomUUID());
        PageRequest pageable = PageRequest.of(0, 20);
        Task task = Task.builder().id(UUID.randomUUID()).build();
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(user));
        when(accessPolicy.accessibleCompanyIds(user)).thenReturn(companyIds);
        when(taskRepository.findByCompanyIdIn(companyIds, pageable))
                .thenReturn(new PageImpl<>(List.of(task), pageable, 1));

        Page<?> result = taskService.getClientTasks(userId, null, pageable);

        assertEquals(1, result.getTotalElements());
        verify(taskRepository).findByCompanyIdIn(companyIds, pageable);
    }

    @Test
    void clientStatusFilterUsesAllAccessibleCompanies() {
        UUID userId = UUID.randomUUID();
        UserProfile user = UserProfile.builder().id(userId).build();
        List<UUID> companyIds = List.of(UUID.randomUUID(), UUID.randomUUID());
        PageRequest pageable = PageRequest.of(0, 20);
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(user));
        when(accessPolicy.accessibleCompanyIds(user)).thenReturn(companyIds);
        when(taskRepository.findByCompanyIdInAndStatus(companyIds, TaskStatus.DONE, pageable))
                .thenReturn(Page.empty(pageable));

        taskService.getClientTasks(userId, TaskStatus.DONE, pageable);

        verify(taskRepository).findByCompanyIdInAndStatus(companyIds, TaskStatus.DONE, pageable);
    }
}
