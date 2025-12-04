package com.marblejar.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "marbles")
public class Marble {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    @Enumerated(EnumType.STRING)
    private MarbleType type = MarbleType.NORMAL;

    private String style;
    private Instant awardedAt = Instant.now();

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public MarbleType getType() { return type; }
    public void setType(MarbleType type) { this.type = type; }

    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }

    public Instant getAwardedAt() { return awardedAt; }
    public void setAwardedAt(Instant awardedAt) { this.awardedAt = awardedAt; }
}
