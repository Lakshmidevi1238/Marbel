package com.marblejar.dto;

public class TaskDto {
    private Long id;
    private String title;
    private String description;
    private Boolean completed;
    private String priority;

    // ⭐ ADD THIS ⭐
    private Long awardedMarbleId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    // ⭐ NEW FIELD ⭐
    public Long getAwardedMarbleId() { return awardedMarbleId; }
    public void setAwardedMarbleId(Long awardedMarbleId) { this.awardedMarbleId = awardedMarbleId; }
}
