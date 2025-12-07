package com.marblejar.service;

import com.marblejar.dto.TaskDto;
import com.marblejar.entity.Marble;
import com.marblejar.entity.MarbleType;
import com.marblejar.entity.Priority;
import com.marblejar.entity.Task;
import com.marblejar.entity.User;
import com.marblejar.exception.NotFoundException;
import com.marblejar.exception.UnauthorizedException;
import com.marblejar.mapper.MarbleMapper;
import com.marblejar.repository.TaskRepository;
import com.marblejar.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final MarbleService marbleService;

    public TaskServiceImpl(TaskRepository taskRepository,
                           UserRepository userRepository,
                           MarbleService marbleService) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.marbleService = marbleService;
    }

    @Override
    public List<TaskDto> findByUserEmail(String email) {
        String norm = email.trim().toLowerCase();
        User user = userRepository.findByEmail(norm)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return taskRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public TaskDto create(String email, TaskDto dto) {
        String norm = email.trim().toLowerCase();
        User user = userRepository.findByEmail(norm)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task t = new Task();
        t.setUser(user);
        t.setTitle(dto.getTitle());
        t.setDescription(dto.getDescription());
        t.setCreatedAt(Instant.now());

        if (dto.getPriority() != null) {
            switch (dto.getPriority().toLowerCase()) {
                case "high": t.setPriority(Priority.HIGH); break;
                case "medium": t.setPriority(Priority.MEDIUM); break;
                case "low": t.setPriority(Priority.LOW); break;
            }
        }

        if (dto.getDueDate() != null && !dto.getDueDate().isBlank()) {
            t.setDueDate(LocalDate.parse(dto.getDueDate()));
        } else {
            t.setDueDate(LocalDate.now());
        }

        return toDto(taskRepository.save(t));
    }

    @Override
    @Transactional
    public TaskDto complete(Long id, String email) {

        Task t = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task not found"));

        String owner = t.getUser().getEmail();
        if (!owner.equalsIgnoreCase(email)) {
            throw new UnauthorizedException("Not allowed");
        }

        if (t.isCompleted()) return toDto(t);

        t.setCompleted(true);
        t.setCompletedAt(Instant.now());

        MarbleType type = MarbleMapper.fromPriority(t.getPriority());

        // ✅ FIX: USE TASK DUE DATE FOR MARBLE DATE
        LocalDate marbleDate = t.getDueDate() != null
                ? t.getDueDate()
                : LocalDate.now();

        Marble marble = marbleService.awardMarble(
                t.getUser().getId(),
                type,
                "default",
                marbleDate   // ✅ THIS IS THE FIX
        );

        // ✅ STORE THE LINK
        t.setAwardedMarbleId(marble.getId());

        taskRepository.save(t);
        return toDto(t);
    }


    private TaskDto toDto(Task t) {
        TaskDto dto = new TaskDto();
        dto.setId(t.getId());
        dto.setTitle(t.getTitle());
        dto.setDescription(t.getDescription());
        dto.setCompleted(t.isCompleted());
        dto.setAwardedMarbleId(t.getAwardedMarbleId());

        if (t.getPriority() != null) {
            dto.setPriority(t.getPriority().name().toLowerCase());
        }

        if (t.getDueDate() != null) {
            dto.setDueDate(t.getDueDate().toString());
        }

        return dto;
    }

    @Override
    @Transactional
    public void deleteIfOwnedBy(Long taskId, String email) {

        Task t = taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Task not found"));

        String owner = t.getUser().getEmail();
        if (!owner.equalsIgnoreCase(email)) {
            throw new UnauthorizedException("Not allowed");
        }

        // ✅ DELETE LINKED MARBLE FIRST
        if (t.getAwardedMarbleId() != null) {
            marbleService.deleteById(t.getAwardedMarbleId());
        }

        taskRepository.deleteById(taskId);
    }

}
