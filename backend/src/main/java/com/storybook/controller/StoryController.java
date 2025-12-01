package com.storybook.controller;

import com.storybook.dto.StoryJsonDto;
import com.storybook.entity.Story;
import com.storybook.service.StoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.storybook.entity.GuestReadingLog;
import com.storybook.repository.GuestReadingLogRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/stories")
@RequiredArgsConstructor
public class StoryController {

    private final StoryService storyService;
    private final GuestReadingLogRepository guestRepo;

    @GetMapping
    public List<Story> getStories(@RequestParam(required = false) String keyword) {
        return storyService.getAllStories(keyword);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Story> getStoryMetadata(@PathVariable String id) {
        return storyService.getStoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/content")
    public ResponseEntity<?> getStoryContent(@PathVariable String id, @RequestHeader(value = "X-Guest-Id", required = false) String guestId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isLoggedIn = auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser");

        if (!isLoggedIn) {
            if (guestId == null || guestId.isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing Guest ID");
            }
            
            LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
            
            // Check if already read this story today
            boolean hasReadToday = guestRepo.existsByGuestIdAndStoryIdAndReadAtAfter(guestId, id, startOfDay);
            
            if (!hasReadToday) {
                // Check quota
                long count = guestRepo.countDistinctStoriesByGuestIdToday(guestId, startOfDay);
                if (count >= 2) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Daily limit reached (2 stories). Please login.");
                }
                // Record new reading
                guestRepo.save(new GuestReadingLog(guestId, id));
            }
        }

        return storyService.getStoryDetail(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
