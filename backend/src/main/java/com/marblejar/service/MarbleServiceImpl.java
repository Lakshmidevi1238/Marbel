package com.marblejar.service;

import com.marblejar.exception.NotFoundException;
import com.marblejar.entity.Marble;
import com.marblejar.entity.MarbleType;
import com.marblejar.entity.User;
import com.marblejar.repository.MarbleRepository;
import com.marblejar.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
public class MarbleServiceImpl implements MarbleService {

    private final MarbleRepository marbleRepository;
    private final UserRepository userRepository;

    public MarbleServiceImpl(MarbleRepository marbleRepository, UserRepository userRepository) {
        this.marbleRepository = marbleRepository;
        this.userRepository = userRepository;
    }

    // ✅ OLD FLOW — STILL WORKS (LOGIN, TESTING, ETC)
    @Override
    public Marble awardMarble(Long userId, MarbleType type, String style) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Marble m = new Marble();
        m.setUser(u);
        m.setType(type);
        m.setStyle(style);
        m.setAwardedAt(Instant.now()); // ✅ TODAY (OLD BEHAVIOR)

        return marbleRepository.save(m);
    }

    // ✅ ✅ ✅ NEW FLOW — THIS FIXES YOUR DATE BUG
    @Override
    public Marble awardMarble(Long userId, MarbleType type, String style, LocalDate awardDate) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Marble m = new Marble();
        m.setUser(u);
        m.setType(type);
        m.setStyle(style);

        // ✅ FORCE MARBLE TO DROP ON TASK DATE
        m.setAwardedAt(
                awardDate.atStartOfDay(ZoneId.systemDefault()).toInstant()
        );

        return marbleRepository.save(m);
    }

    @Override
    public void awardMarbleForUsername(String email, MarbleType type, String style) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found: " + email));

        awardMarble(user.getId(), type, style);
    }

    @Override
    public List<Marble> listByUser(Long userId) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return marbleRepository.findByUser(u);
    }

    @Override
    public long countByUserAndType(Long userId, MarbleType type) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return marbleRepository.countByUserAndType(u, type);
    }

    // ✅ DELETE MARBLE WHEN TASK IS DELETED
    @Override
    public void deleteById(Long marbleId) {
        marbleRepository.deleteById(marbleId);
    }
}
