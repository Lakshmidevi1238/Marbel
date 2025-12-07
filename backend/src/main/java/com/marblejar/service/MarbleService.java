package com.marblejar.service;

import com.marblejar.entity.Marble;
import com.marblejar.entity.MarbleType;

import java.time.LocalDate;
import java.util.List;

public interface MarbleService {

    // ✅ EXISTING — DO NOT BREAK OLD FLOWS
    Marble awardMarble(Long userId, MarbleType type, String style);

    // ✅ NEW — USED BY TASK COMPLETION WITH CORRECT DATE
    Marble awardMarble(Long userId, MarbleType type, String style, LocalDate awardDate);

    void awardMarbleForUsername(String email, MarbleType type, String style);

    List<Marble> listByUser(Long userId);

    long countByUserAndType(Long userId, MarbleType type);

    void deleteById(Long marbleId);
}
