package com.fogistanbul.crm.task.application;

import com.fogistanbul.crm.company.application.PermissionService;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.Task;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.entity.enums.TaskStatus;
import com.fogistanbul.crm.task.dto.CreateTaskRequest;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.PrProjectPhaseRepository;
import com.fogistanbul.crm.repository.PrProjectRepository;
import com.fogistanbul.crm.repository.TaskNoteRepository;
import com.fogistanbul.crm.repository.TaskRepository;
import com.fogistanbul.crm.repository.TaskReviewRepository;
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
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;
    @Mock
    private TaskNoteRepository taskNoteRepository;
    @Mock
    private TaskReviewRepository taskReviewRepository;
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
    @Mock
    private TaskNotificationPublisher notificationPublisher;
    @Mock
    private PermissionService permissionService;

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

    @Test
    void deleteTaskRemovesReviewsAndNotesBeforeTask() {
        UUID taskId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UserProfile user = UserProfile.builder().id(userId).build();
        Task task = Task.builder().id(taskId).build();
        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(user));

        taskService.deleteTask(taskId, userId);

        verify(accessPolicy).requireDelete(task, user);
        var order = inOrder(taskReviewRepository, taskNoteRepository, taskRepository);
        order.verify(taskReviewRepository).deleteByTaskId(taskId);
        order.verify(taskNoteRepository).deleteByTaskId(taskId);
        order.verify(taskRepository).delete(task);
    }

    @Test
    void createTaskPublishesAdditionalSelectedRecipients() {
        UUID creatorId = UUID.randomUUID();
        UUID assigneeId = UUID.randomUUID();
        UUID extraRecipientId = UUID.randomUUID();
        UserProfile creator = UserProfile.builder().id(creatorId).globalRole(GlobalRole.AGENCY_STAFF).email("creator@example.com").build();
        UserProfile assignee = UserProfile.builder().id(assigneeId).globalRole(GlobalRole.AGENCY_STAFF).email("assignee@example.com").build();
        UserProfile extraRecipient = UserProfile.builder().id(extraRecipientId).globalRole(GlobalRole.AGENCY_STAFF).email("extra@example.com").build();
        Task saved = Task.builder()
                .id(UUID.randomUUID())
                .createdBy(creator)
                .assignedTo(assignee)
                .title("Yeni görev")
                .build();
        CreateTaskRequest request = new CreateTaskRequest();
        request.setAssignedToId(assigneeId);
        request.setTitle("Yeni görev");
        request.setNotifyUserIds(List.of(extraRecipientId, assigneeId, creatorId, extraRecipientId));

        when(userProfileRepository.findById(creatorId)).thenReturn(Optional.of(creator));
        when(userProfileRepository.findById(assigneeId)).thenReturn(Optional.of(assignee));
        when(userProfileRepository.findAllById(List.of(extraRecipientId))).thenReturn(List.of(extraRecipient));
        when(taskRepository.save(org.mockito.ArgumentMatchers.any(Task.class))).thenReturn(saved);

        taskService.createTask(request, creatorId);

        verify(accessPolicy).requireRead(saved, extraRecipient);
        verify(notificationPublisher).notifySelectedRecipients(saved, creator, assignee, List.of(extraRecipientId));
    }

    @Test
    void createTaskKeepsLegacyCompanyBroadcastWhenNotifyListIsOmitted() {
        UUID creatorId = UUID.randomUUID();
        UUID assigneeId = UUID.randomUUID();
        UserProfile creator = UserProfile.builder().id(creatorId).globalRole(GlobalRole.AGENCY_STAFF).email("creator@example.com").build();
        UserProfile assignee = UserProfile.builder().id(assigneeId).globalRole(GlobalRole.AGENCY_STAFF).email("assignee@example.com").build();
        Task saved = Task.builder()
                .id(UUID.randomUUID())
                .createdBy(creator)
                .assignedTo(assignee)
                .title("Yeni görev")
                .build();
        CreateTaskRequest request = new CreateTaskRequest();
        request.setAssignedToId(assigneeId);
        request.setTitle("Yeni görev");

        when(userProfileRepository.findById(creatorId)).thenReturn(Optional.of(creator));
        when(userProfileRepository.findById(assigneeId)).thenReturn(Optional.of(assignee));
        when(taskRepository.save(org.mockito.ArgumentMatchers.any(Task.class))).thenReturn(saved);

        taskService.createTask(request, creatorId);

        verify(notificationPublisher).notifyCompanyMembersAboutNew(saved, assignee, creatorId);
    }

    @Test
    void clientTaskCreationRequiresCreatePermissionForCompany() {
        UUID creatorId = UUID.randomUUID();
        UUID assigneeId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        UserProfile creator = UserProfile.builder().id(creatorId).globalRole(GlobalRole.COMPANY_USER).email("creator@example.com").build();
        UserProfile assignee = UserProfile.builder().id(assigneeId).globalRole(GlobalRole.AGENCY_STAFF).email("assignee@example.com").build();
        Task saved = Task.builder()
                .id(UUID.randomUUID())
                .createdBy(creator)
                .assignedTo(assignee)
                .title("Yeni görev")
                .build();
        CreateTaskRequest request = new CreateTaskRequest();
        request.setCompanyId(companyId);
        request.setAssignedToId(assigneeId);
        request.setTitle("Yeni görev");
        request.setNotifyUserIds(List.of());

        when(companyRepository.findById(companyId)).thenReturn(Optional.of(Company.builder().id(companyId).build()));
        when(userProfileRepository.findById(creatorId)).thenReturn(Optional.of(creator));
        when(userProfileRepository.findById(assigneeId)).thenReturn(Optional.of(assignee));
        when(taskRepository.save(org.mockito.ArgumentMatchers.any(Task.class))).thenReturn(saved);

        taskService.createClientTask(request, creatorId);

        verify(permissionService).requireFullPermission(creatorId, companyId, "tasks.create");
    }
}
