package com.marblejar.service;

import com.marblejar.entity.Marble;
import com.marblejar.entity.MarbleType;

import java.util.List;

public interface MarbleService {
    Marble awardMarble(Long userId, MarbleType type, String style);
    List<Marble> listByUser(Long userId);
    long countByUserAndType(Long userId, MarbleType type);
    void awardMarbleForUsername(String email, MarbleType type, String style);
}
