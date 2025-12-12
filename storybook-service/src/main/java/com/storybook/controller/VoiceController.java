package com.storybook.controller;

import com.storybook.entity.User;
import com.storybook.entity.UserVoice;
import com.storybook.repository.UserRepository;
import com.storybook.service.VoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/voices")
@RequiredArgsConstructor
public class VoiceController {

    private final VoiceService voiceService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<UserVoice> uploadVoice(@RequestParam("name") String name,
                                                 @RequestParam("file") MultipartFile file) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        UserVoice voice = voiceService.uploadVoice(user.getId(), name, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(voice);
    }

    @GetMapping
    public ResponseEntity<List<UserVoice>> getMyVoices() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        return ResponseEntity.ok(voiceService.getUserVoices(user.getId()));
    }
}
