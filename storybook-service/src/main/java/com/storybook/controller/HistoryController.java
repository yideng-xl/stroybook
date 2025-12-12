package com.storybook.controller;

import com.storybook.dto.ReadingProgressDto;
import com.storybook.entity.ReadingProgress;
import com.storybook.entity.Story;
import com.storybook.entity.User;
import com.storybook.repository.ReadingProgressRepository;
import com.storybook.repository.StoryRepository;
import com.storybook.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryController {

    private final ReadingProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final StoryRepository storyRepository;

    @GetMapping
    public List<ReadingProgressDto> getHistory() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();

        return progressRepository.findByUserOrderByUpdatedAtDesc(user).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> saveProgress(@RequestBody ReadingProgressDto dto) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();

        ReadingProgress progress = progressRepository.findByUserAndStoryId(user, dto.getStoryId())
                .orElse(new ReadingProgress(user, dto.getStoryId(), dto.getStyleName(), dto.getCurrentPage()));

        progress.setCurrentPage(dto.getCurrentPage());
        progress.setStyleName(dto.getStyleName());
        // Accumulate duration
        progress.setDurationSeconds(progress.getDurationSeconds() + dto.getDurationSeconds());
        
        progressRepository.save(progress);
        return ResponseEntity.ok().build();
    }

    private ReadingProgressDto convertToDto(ReadingProgress entity) {
        ReadingProgressDto dto = new ReadingProgressDto();
        dto.setStoryId(entity.getStoryId());
        dto.setStyleName(entity.getStyleName());
        dto.setCurrentPage(entity.getCurrentPage());
        dto.setDurationSeconds(entity.getDurationSeconds());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        // Fetch title
        storyRepository.findById(entity.getStoryId())
                .ifPresent(story -> dto.setStoryTitle(story.getTitleZh()));
        
        return dto;
    }
}
