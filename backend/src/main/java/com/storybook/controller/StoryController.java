package com.storybook.controller;

import com.storybook.dto.StoryJsonDto;
import com.storybook.entity.Story;
import com.storybook.entity.StoryStatus;
import com.storybook.service.StoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // Correct Import
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import com.storybook.entity.GuestReadingLog;
import com.storybook.repository.GuestReadingLogRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpStatus;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.storybook.dto.GenerateStoryRequest;
import com.storybook.dto.GenerateStoryResponse;
import com.storybook.dto.StoryCallbackRequest;

@RestController
@RequestMapping("/api/stories")
@RequiredArgsConstructor
@Slf4j // Use simple annotation
public class StoryController {

    private final StoryService storyService;
    private final GuestReadingLogRepository guestRepo;

    @GetMapping
    public List<Story> getStories(@RequestParam(required = false) String keyword,
                                @RequestParam(required = false) String status) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isLoggedIn = auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser");
        String userId = isLoggedIn ? auth.getName() : null;

        log.info("getStories called by user: {}, status: {}, keyword: {}", userId, status, keyword);

        List<Story> stories;
        if (status != null && !status.isEmpty()) {
            try {
                StoryStatus storyStatus = StoryStatus.valueOf(status.toUpperCase());
                stories = storyService.getStoriesByStatus(userId, storyStatus, keyword);
            } catch (IllegalArgumentException e) {
                return List.of();
            }
        } else {
            stories = storyService.getAllStories(userId, keyword);
        }
        
        // Debug Log
        if (!stories.isEmpty()) {
            log.info("Returning {} stories. First story ID: {}, UserID: {}, Status: {}", 
                stories.size(), stories.get(0).getId(), stories.get(0).getUserId(), stories.get(0).getStatus());
        }

        return stories;
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

    @PostMapping("/generate")
    public ResponseEntity<GenerateStoryResponse> generateStory(@Valid @RequestBody GenerateStoryRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = auth.getName(); // Get userId from authenticated user
        String storyId = storyService.initiateStoryGeneration(userId, request.getPrompt(), request.getStyle());
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(new GenerateStoryResponse(storyId));
    }

    @PostMapping("/callback")
    public ResponseEntity<Void> n8nCallback(@Valid @RequestBody StoryCallbackRequest request) {
        storyService.handleN8NCallback(request.getStoryId(), request.getStatus(), request.getErrorMessage());
        return ResponseEntity.ok().build();
    }
}
