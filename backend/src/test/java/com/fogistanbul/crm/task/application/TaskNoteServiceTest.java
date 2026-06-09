package com.fogistanbul.crm.task.application;

import com.fogistanbul.crm.entity.Task;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.repository.TaskNoteRepository;
import com.fogistanbul.crm.repository.TaskRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.task.dto.CreateTaskNoteRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskNoteServiceTest {

    @Mock
    private TaskRepository taskRepository;
    @Mock
    private TaskNoteRepository taskNoteRepository;
    @Mock
    private UserProfileRepository userProfileRepository;
    @Mock
    private TaskAccessPolicy accessPolicy;
    @Mock
    private TaskMapper mapper;

    @InjectMocks
    private TaskNoteService taskNoteService;

    @Test
    void notesCannotBeReadWithoutTaskAccess() {
        UUID taskId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Task task = Task.builder().id(taskId).build();
        UserProfile user = UserProfile.builder().id(userId).build();
        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(user));
        doThrow(new AccessDeniedException("denied")).when(accessPolicy).requireRead(task, user);

        assertThrows(
                AccessDeniedException.class,
                () -> taskNoteService.getTaskNotes(taskId, userId)
        );
        verifyNoInteractions(taskNoteRepository);
    }

    @Test
    void noteCannotBeAddedWithoutUpdateAccess() {
        UUID taskId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Task task = Task.builder().id(taskId).build();
        UserProfile user = UserProfile.builder().id(userId).build();
        CreateTaskNoteRequest request = new CreateTaskNoteRequest();
        request.setContent("note");
        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(user));
        doThrow(new AccessDeniedException("denied")).when(accessPolicy).requireUpdate(task, user);

        assertThrows(
                AccessDeniedException.class,
                () -> taskNoteService.addTaskNote(taskId, request, userId)
        );
        verifyNoInteractions(taskNoteRepository);
    }
}
