package com.storybook.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storybook.dto.StoryJsonDto;
import com.storybook.entity.Story;
import com.storybook.entity.StoryStatus;
import com.storybook.repository.StoryRepository;
import com.storybook.service.N8NService;
import com.storybook.service.StoryService;
import com.storybook.service.StorySyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class StoryServiceImpl implements StoryService {

    private final StoryRepository storyRepository;
    private final N8NService n8nService;
    private final StorySyncService storySyncService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${storybook.stories-path:../stories}")
    private String storiesPath;

    @Override
    public List<Story> getAllStories(String userId, String keyword) {
        // Always return all PUBLISHED stories for the public feed, regardless of login status
        if (keyword != null && !keyword.isBlank()) {
            return storyRepository.findByStatusAndTitleZhContainingIgnoreCaseOrStatusAndTitleEnContainingIgnoreCaseOrderByCreatedAtDesc(
                    StoryStatus.PUBLISHED, keyword, StoryStatus.PUBLISHED, keyword
            );
        } else {
            return storyRepository.findByStatusOrderByCreatedAtDesc(StoryStatus.PUBLISHED);
        }
    }

    @Override
    public List<Story> getStoriesByStatus(String userId, StoryStatus status, String keyword) {
        if (userId == null) {
            // Guests can only see PUBLISHED stories, no filtering by other statuses
            return List.of();
        }

        if (keyword != null && !keyword.isBlank()) {
            // Combined search by user, status, and keyword
            return storyRepository.findByUserIdAndStatusAndTitleZhContainingIgnoreCaseOrUserIdAndStatusAndTitleEnContainingIgnoreCaseOrderByCreatedAtDesc(
                    userId, status, keyword, userId, status, keyword
            );
        } else {
            return storyRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status);
        }
    }

    @Override
    public Optional<Story> getStoryById(String id) {
        return storyRepository.findById(id);
    }

    @Override
    public Optional<StoryJsonDto> getStoryDetail(String id) {
        // Retrieve full content from DB first
        Optional<Story> storyOpt = storyRepository.findById(id);
        
        if (storyOpt.isPresent()) {
            Story story = storyOpt.get();
            // Check if story pages are populated (should be if synced)
            if (story.getPages() != null && !story.getPages().isEmpty()) {
                StoryJsonDto dto = new StoryJsonDto();
                dto.setTitleZh(story.getTitleZh());
                dto.setTitleEn(story.getTitleEn());
                dto.setFullStory(story.getDescription()); // Assuming description holds full text or similar
                // We might need to map styles too, but frontend usually selects style separately.
                // For basic detail, populate pages.
                
                List<StoryJsonDto.PageDto> pageDtos = story.getPages().stream().map(page -> {
                    StoryJsonDto.PageDto p = new StoryJsonDto.PageDto();
                    p.setPageNumber(page.getPageNumber());
                    p.setTextZh(page.getTextZh());
                    p.setTextEn(page.getTextEn());
                    p.setAudioUrlZh(page.getAudioUrlZh());
                    p.setAudioUrlEn(page.getAudioUrlEn());
                    return p;
                }).toList();
                
                dto.setPages(pageDtos);
                return Optional.of(dto);
            }
        }

        // Fallback to filesystem if DB pages are empty (e.g. old legacy stories not fully synced)
        // Retrieve full content from filesystem
        String styleId = storyRepository.findById(id).map(Story::getSelectedStyleId).orElse("default");
        
        // Try style-specific path first (MVP3)
        File jsonFile = new File(storiesPath + File.separator + id + File.separator + styleId, "story.json");
        
        // Fallback to root path (MVP2 compatibility)
        if (!jsonFile.exists()) {
             File rootJsonFile = new File(storiesPath + File.separator + id, "story.json");
             if (rootJsonFile.exists()) {
                 jsonFile = rootJsonFile;
             }
        }

        if (jsonFile.exists()) {
            try {
                StoryJsonDto dto = objectMapper.readValue(jsonFile, StoryJsonDto.class);
                return Optional.of(dto);
            } catch (IOException e) {
                log.error("Error reading story detail for {}", id, e);
            }
        }
        return Optional.empty();
    }

    @Override
    @Transactional
    public String initiateStoryGeneration(String userId, String prompt, String style) {
        String storyId = UUID.randomUUID().toString();

        Story newStory = new Story();
        newStory.setId(storyId);
        newStory.setUserId(userId);
        newStory.setStatus(StoryStatus.GENERATING);
        newStory.setGenerationPrompt(prompt);
        newStory.setSelectedStyleId(style); // User selected style for generation
        // Title and description will be filled after N8N callback and sync
        storyRepository.save(newStory);

        // Trigger N8N webhook asynchronously
        n8nService.triggerN8NWebhook(storyId, prompt, style, userId);

        log.info("Story generation initiated for userId: {} with storyId: {}", userId, storyId);
        return storyId;
    }

    @Override
    @Transactional
    public void handleN8NCallback(String storyId, String status, String errorMessage) {
        Optional<Story> optionalStory = storyRepository.findById(storyId);
        if (optionalStory.isEmpty()) {
            log.error("N8N Callback received for non-existent storyId: {}", storyId);
            return;
        }

        Story story = optionalStory.get();
        story.setUpdatedAt(LocalDateTime.now());

        try {
            // Map "SUCCESS" from N8N to "PUBLISHED" in backend
            String normalizedStatus = status.toUpperCase();
            if ("SUCCESS".equals(normalizedStatus)) {
                normalizedStatus = "PUBLISHED";
            }
            
            StoryStatus newStatus = StoryStatus.valueOf(normalizedStatus);
            story.setStatus(newStatus);
            story.setErrorMessage(errorMessage);

            if (newStatus == StoryStatus.PUBLISHED) {
                log.info("N8N Callback: Story {} generation SUCCESS. Triggering file sync.", storyId);
                // Trigger story file sync after successful generation
                storySyncService.syncStoryFiles(storyId); // Ensure this method can sync a single story
            } else if (newStatus == StoryStatus.FAILED) {
                log.warn("N8N Callback: Story {} generation FAILED. Error: {}", storyId, errorMessage);
            }
        } catch (IllegalArgumentException e) {
            log.error("N8N Callback received invalid status: {} for storyId: {}", status, storyId);
            story.setStatus(StoryStatus.FAILED); // Set to failed for invalid status
            story.setErrorMessage("Invalid status received from N8N: " + status);
        } finally {
            storyRepository.save(story);
        }
    }
}
