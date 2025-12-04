package com.marblejar.controller;

import com.marblejar.entity.Marble;
import com.marblejar.service.MarbleService;
import com.marblejar.repository.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marbles")
public class MarbleController {

    private final MarbleService marbleService;
    private final UserRepository userRepository;

    public MarbleController(MarbleService marbleService, UserRepository userRepository) {
        this.marbleService = marbleService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Marble> list(@AuthenticationPrincipal UserDetails ud) {
        Long userId = userRepository.findByEmail(ud.getUsername()).orElseThrow().getId();
        return marbleService.listByUser(userId);
    }

    @GetMapping("/inventory")
    public Object inventory(@AuthenticationPrincipal UserDetails ud) {
        Long userId = userRepository.findByEmail(ud.getUsername()).orElseThrow().getId();
        long normal = marbleService.listByUser(userId).stream().filter(m -> m.getType() == com.marblejar.entity.MarbleType.NORMAL).count();
        long gold = marbleService.listByUser(userId).stream().filter(m -> m.getType() == com.marblejar.entity.MarbleType.GOLD).count();
        long special = marbleService.listByUser(userId).stream().filter(m -> m.getType() == com.marblejar.entity.MarbleType.SPECIAL).count();
        return java.util.Map.of("normal", normal, "gold", gold, "special", special);
    }

    @PostMapping("/style")
    public Object changeStyle(@AuthenticationPrincipal UserDetails ud, @RequestBody String style) {
        var user = userRepository.findByEmail(ud.getUsername()).orElseThrow();
        user.setPreferences(style);
        userRepository.save(user);
        return java.util.Map.of("status", "ok");
    }
}
