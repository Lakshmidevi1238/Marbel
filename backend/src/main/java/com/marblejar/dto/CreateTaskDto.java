package com.marblejar.dto;

public class CreateTaskDto {
    private String title;
    private String description;
    private String priority; // optional: "high" | "medium" | "low" | null

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
}
