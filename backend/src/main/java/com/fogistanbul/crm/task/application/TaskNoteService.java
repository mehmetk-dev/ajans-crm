package com.fogistanbul.crm.task.application;

import com.fogistanbul.crm.entity.Task;
import com.fogistanbul.crm.entity.TaskNote;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.repository.TaskNoteRepository;
import com.fogistanbul.crm.repository.TaskRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.task.dto.CreateTaskNoteRequest;
import com.fogistanbul.crm.task.dto.TaskNoteResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskNoteService {

    private final TaskRepository taskRepository;
    private final TaskNoteRepository taskNoteRepository;
    private final UserProfileRepository userProfileRepository;
    private final TaskAccessPolicy accessPolicy;
    private final TaskMapper mapper;

    @Transactional(readOnly = true)
    public List<TaskNoteResponse> getTaskNotes(UUID taskId, UUID userId) {
        Task task = getTask(taskId);
        accessPolicy.requireRead(task, getUser(userId));
        return taskNoteRepository.findByTaskIdOrderByCreatedAtDesc(taskId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional
    public TaskNoteResponse addTaskNote(UUID taskId, CreateTaskNoteRequest request, UUID userId) {
        Task task = getTask(taskId);
        UserProfile author = getUser(userId);
        accessPolicy.requireUpdate(task, author);
        TaskNote note = TaskNote.builder()
                .task(task)
                .author(author)
                .content(request.getContent())
                .build();
        return mapper.toResponse(taskNoteRepository.save(note));
    }

    @Transactional
    public void deleteTaskNote(UUID noteId, UUID userId) {
        TaskNote note = taskNoteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Not bulunamadi"));
        UserProfile user = getUser(userId);
        accessPolicy.requireRead(note.getTask(), user);
        if (!note.getAuthor().getId().equals(userId) && user.getGlobalRole() != GlobalRole.ADMIN) {
            throw new AccessDeniedException("Bu notu silme yetkiniz yok");
        }
        taskNoteRepository.delete(note);
    }

    private Task getTask(UUID taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Gorev bulunamadi"));
    }

    private UserProfile getUser(UUID userId) {
        return userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi"));
    }
}
