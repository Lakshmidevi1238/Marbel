package com.marblejar.service;

import com.marblejar.dto.TaskDto;

import java.util.List;

public interface TaskService {
    List<TaskDto> findByUserEmail(String email);
    TaskDto create(String email, TaskDto dto);
    TaskDto complete(Long id, String email);
    void deleteIfOwnedBy(Long taskId, String ownerEmail);
}
