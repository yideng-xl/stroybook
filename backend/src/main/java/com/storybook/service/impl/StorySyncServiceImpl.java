package com.storybook.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storybook.dto.StoryJsonDto;
import com.storybook.entity.Story;
import com.storybook.entity.StoryPage;
import com.storybook.entity.StoryStatus;
import com.storybook.entity.StoryStyle;
import com.storybook.repository.StoryPageRepository;
import com.storybook.repository.StoryRepository;
import com.storybook.service.StorySyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class StorySyncServiceImpl implements StorySyncService {

    private final StoryRepository storyRepository;
    private final StoryPageRepository storyPageRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${storybook.stories-path:../stories}")
    private String storiesPath;

    @Override
    @EventListener(ApplicationReadyEvent.class) // Auto-sync on startup
    @Transactional
    public void syncStories() {
        log.info("Starting full story synchronization from path: {}", storiesPath);
        File rootDir = new File(storiesPath);

        if (!rootDir.exists() || !rootDir.isDirectory()) {
            log.error("Stories directory not found: {}", rootDir.getAbsolutePath());
            return;
        }

        File[] storyFolders = rootDir.listFiles(File::isDirectory);
        if (storyFolders == null) {
            log.info("No story folders found in {}.", rootDir.getAbsolutePath());
            return;
        }

        List<String> foundStoryIds = new ArrayList<>();
        for (File folder : storyFolders) {
            String storyId = folder.getName();
            foundStoryIds.add(storyId);
            log.info("Attempting to sync story folder: {}", storyId);
            try {
                // For full sync, we try to infer selectedStyleId if not set in DB
                Optional<Story> existingStory = storyRepository.findById(storyId);
                String styleToSync = null;

                if (existingStory.isPresent() && existingStory.get().getSelectedStyleId() != null) {
                    styleToSync = existingStory.get().getSelectedStyleId();
                } else {
                    // Try to find a style subfolder if no selected style is present in DB
                    File[] styleSubFolders = folder.listFiles(File::isDirectory);
                    if (styleSubFolders != null && styleSubFolders.length > 0) {
                        styleToSync = styleSubFolders[0].getName(); // Take the first one found
                        
                        Story story;
                        if (existingStory.isPresent()) {
                            story = existingStory.get();
                        } else {
                            story = new Story();
                            story.setId(storyId);
                            story.setStatus(StoryStatus.PUBLISHED); // Assume existing files are published
                        }
                        story.setSelectedStyleId(styleToSync);
                        storyRepository.save(story);
                    }
                }

                if (styleToSync != null) {
                    syncStoryFilesInternal(storyId, styleToSync);
                } else {
                    log.warn("Skipping full sync for story {}: no selectedStyleId in DB and no style subfolders found.", storyId);
                }
            } catch (Exception e) {
                log.error("Error during full sync for story {}: {}", storyId, e.getMessage());
            }
        }

        // TODO: Optionally, remove stories from DB that are no longer present in filesystem
        log.info("Full story synchronization completed.");
    }

    @Override
    @Transactional
    public void syncStoryFiles(String storyId) {
        Optional<Story> optionalStory = storyRepository.findById(storyId);
        if (optionalStory.isEmpty()) {
            log.error("Story {} not found in DB for single file sync.", storyId);
            return;
        }
        Story story = optionalStory.get();

        String selectedStyleId = story.getSelectedStyleId();
        if (selectedStyleId == null || selectedStyleId.isEmpty()) {
            log.error("Story {} has no selectedStyleId, cannot perform single file sync.", storyId);
            story.setStatus(StoryStatus.FAILED);
            story.setErrorMessage("No selected style for generation.");
            storyRepository.save(story);
            return;
        }

        syncStoryFilesInternal(storyId, selectedStyleId);
    }

    private void syncStoryFilesInternal(String storyId, String styleId) {
        // The story.json is now directly under the storyId folder, not a style subfolder.
        File storyJsonFile = new File(storiesPath + File.separator + storyId, "story.json");
        
        log.info("Attempting to sync story JSON file from path: {}", storyJsonFile.getAbsolutePath());

        if (!storyJsonFile.exists()) {
            log.warn("Story JSON file not found for storyId: {}. Path: {}. Setting status to FAILED.", storyId, storyJsonFile.getAbsolutePath());
            updateStoryStatusAndError(storyId, StoryStatus.FAILED, "Story JSON file not found at: " + storyJsonFile.getAbsolutePath());
            return;
        }

        try {
            StoryJsonDto dto = objectMapper.readValue(storyJsonFile, StoryJsonDto.class);

            // Fetch story again to ensure latest state and avoid detached entity issues
            Story story = storyRepository.findById(storyId).orElseThrow(() -> new RuntimeException("Story not found during internal sync: " + storyId));
            
            story.setTitleZh(dto.getTitleZh());
            story.setTitleEn(dto.getTitleEn());
            story.setDescription(dto.getFullStory() != null && !dto.getFullStory().isBlank() ? dto.getFullStory().substring(0, Math.min(dto.getFullStory().length(), 200)) : "");
            story.setStatus(StoryStatus.PUBLISHED); // Mark as published after successful sync
            story.setUpdatedAt(LocalDateTime.now());

            // Clear and recreate pages
            storyPageRepository.deleteByStoryId(storyId); // Delete all pages for this story
            story.getPages().clear(); // Clear collection to reflect changes
            dto.getPages().forEach(pageDto -> {
                StoryPage page = new StoryPage();
                page.setStory(story);
                page.setPageNumber(pageDto.getPageNumber());
                page.setTextZh(pageDto.getTextZh());
                page.setTextEn(pageDto.getTextEn());
                // Image URL still depends on selectedStyleId
                page.setImageUrl(getCoverImagePath(storyId, styleId, pageDto.getPageNumber()));
                story.getPages().add(page);
            });

            // Clear and recreate styles (assuming one generated style per story for now)
            story.getStyles().clear();
            StoryStyle newStyle = new StoryStyle(
                story,
                styleId, // Using styleId from path
                dto.getStyleEn() != null && !dto.getStyleEn().isBlank() ? dto.getStyleEn() : styleId,
                getCoverImagePath(storyId, styleId, 1) // Cover is always page 1 of the selected style
            );
            story.getStyles().add(newStyle);

            storyRepository.save(story); // Saves story, cascades to pages and styles
            log.info("Story {} (style {}) synced successfully.", storyId, styleId);

        } catch (IOException e) {
            log.error("Failed to parse story.json for storyId: {}. Error: {}", storyId, e.getMessage());
            updateStoryStatusAndError(storyId, StoryStatus.FAILED, "Failed to parse story.json: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error during story sync for storyId: {}. Error: {}", storyId, e.getMessage());
            updateStoryStatusAndError(storyId, StoryStatus.FAILED, "Unexpected error during sync: " + e.getMessage());
        }
    }

    // Helper to update story status and error message
    private void updateStoryStatusAndError(String storyId, StoryStatus status, String errorMessage) {
        storyRepository.findById(storyId).ifPresent(story -> {
            story.setStatus(status);
            story.setErrorMessage(errorMessage);
            story.setUpdatedAt(LocalDateTime.now());
            storyRepository.save(story);
        });
    }

    // Adjusted to accept pageNumber
    private String getCoverImagePath(String storyId, String styleName, int pageNumber) {
        return "/stories/" + storyId + File.separator + styleName + File.separator + "page-" + pageNumber + ".png";
    }

    // Original getCoverImagePath, kept for backward compatibility if needed, but the new one is more precise
    private String getCoverImagePath(String storyId, String styleName) {
        return getCoverImagePath(storyId, styleName, 1);
    }

    // Renamed from processStoryFolder to be more explicit about internal use
    // This method is no longer used by syncStories directly, syncStories will call syncStoryFilesInternal
    // private void processStoryFolder(File folder) {
    //     // ... original logic, now moved into syncStoryFilesInternal
    // }
}
