package com.marblejar.controller;

import com.marblejar.dto.CreateTaskDto;
import com.marblejar.dto.TaskDto;
import com.marblejar.entity.MarbleType;
import com.marblejar.exception.NotFoundException;
import com.marblejar.exception.UnauthorizedException;
import com.marblejar.repository.UserRepository;
import com.marblejar.service.MarbleService;
import com.marblejar.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;
    private final MarbleService marbleService;
    private final UserRepository userRepository;

    public TaskController(TaskService taskService,
                          MarbleService marbleService,
                          UserRepository userRepository) {
        this.taskService = taskService;
        this.marbleService = marbleService;
        this.userRepository = userRepository;
    }

    /**
     * List tasks for authenticated user. Uses Authentication.getName() to obtain username.
     */
    @GetMapping
    public List<TaskDto> list(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new UnauthorizedException("Not authenticated");
        }
        String username = authentication.getName();
        return taskService.findByUserEmail(username);
    }

    /**
     * Create a task for the authenticated user.
     */
    @PostMapping
    public TaskDto create(Authentication authentication, @RequestBody CreateTaskDto createDto) {
        if (authentication == null || authentication.getName() == null) {
            throw new UnauthorizedException("Not authenticated");
        }

        String username = authentication.getName();

        TaskDto dto = new TaskDto();
        dto.setTitle(createDto.getTitle());
        dto.setDescription(createDto.getDescription());

        dto.setPriority(
            createDto.getPriority() == null
                ? null
                : createDto.getPriority().trim().toLowerCase()
        );

        // ✅✅✅ THIS IS THE MISSING LINE THAT CAUSED ALL THE CHAOS
        dto.setDueDate(createDto.getDueDate());

        return taskService.create(username, dto);
    }


    /**
     * Mark a task complete and return the updated TaskDto.
     * Note: the service layer handles awarding marbles — controller does not double-award.
     */
    @PostMapping("/{id}/complete")
    public ResponseEntity<TaskDto> complete(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new UnauthorizedException("Not authenticated");
        }
        String username = authentication.getName();

        TaskDto t = taskService.complete(id, username);
        return ResponseEntity.ok(t);
    }

    /**
     * Delete a task if owned by the authenticated user.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        String username = authentication.getName();
        try {
            taskService.deleteIfOwnedBy(id, username);
            return ResponseEntity.ok(Map.of("status", "deleted", "id", id));
        } catch (NotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("error", "Task not found"));
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(403).body(Map.of("error", "Not allowed"));
        }
    }
}
