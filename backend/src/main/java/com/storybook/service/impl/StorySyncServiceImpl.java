package com.storybook.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storybook.dto.StoryJsonDto;
import com.storybook.entity.Story;
import com.storybook.entity.StoryStyle;
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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class StorySyncServiceImpl implements StorySyncService {

    private final StoryRepository storyRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${storybook.stories-path:../stories}")
    private String storiesPath;

    @Override
    @EventListener(ApplicationReadyEvent.class) // Auto-sync on startup
    @Transactional
    public void syncStories() {
        log.info("Starting story synchronization from path: {}", storiesPath);
        File rootDir = new File(storiesPath);

        if (!rootDir.exists() || !rootDir.isDirectory()) {
            log.error("Stories directory not found: {}", rootDir.getAbsolutePath());
            return;
        }

        File[] storyFolders = rootDir.listFiles(File::isDirectory);
        if (storyFolders == null) return;

        for (File folder : storyFolders) {
            processStoryFolder(folder);
        }
        log.info("Story synchronization completed.");
    }

    private void processStoryFolder(File folder) {
        String storyId = folder.getName();
        File jsonFile = new File(folder, "story.json");

        if (!jsonFile.exists()) {
            log.warn("Skipping folder {}, missing story.json", storyId);
            return;
        }

        try {
            StoryJsonDto dto = objectMapper.readValue(jsonFile, StoryJsonDto.class);
            
            // Upsert Story
            Story story = storyRepository.findById(storyId).orElse(new Story());
            story.setId(storyId);
            story.setTitleZh(dto.getTitleZh());
            story.setTitleEn(dto.getTitleEn());
            // Description can be fullStory or a summary
            story.setDescription(dto.getFullStory() != null ? dto.getFullStory().substring(0, Math.min(dto.getFullStory().length(), 200)) : "");
            
            // Sync Styles
            updateStyles(story, folder, dto);
            
            storyRepository.save(story);
            log.info("Synced story: {}", storyId);

        } catch (IOException e) {
            log.error("Failed to parse story.json in {}", storyId, e);
        }
    }

    private void updateStyles(Story story, File folder, StoryJsonDto dto) {
        File[] subFiles = folder.listFiles(File::isDirectory);
        if (subFiles == null) return;

        List<StoryStyle> currentStyles = story.getStyles();
        
        for (File styleFolder : subFiles) {
            String styleName = styleFolder.getName();
            String styleNameEn = styleName; // Default to Zh

            // Try to match with metadata
            if (dto.getStyleZh() != null && dto.getStyleZh().equals(styleName)) {
                if (dto.getStyleEn() != null) {
                    styleNameEn = dto.getStyleEn();
                }
            }
            
            String finalStyleNameEn = styleNameEn; // effectively final for lambda

            Optional<StoryStyle> existing = currentStyles.stream()
                    .filter(s -> s.getName().equals(styleName))
                    .findFirst();

            if (existing.isPresent()) {
                existing.get().setCoverImage(getCoverImagePath(story.getId(), styleName));
                existing.get().setNameEn(finalStyleNameEn);
            } else {
                StoryStyle newStyle = new StoryStyle(story, styleName, finalStyleNameEn, getCoverImagePath(story.getId(), styleName));
                story.getStyles().add(newStyle);
            }
        }
    }

    private String getCoverImagePath(String storyId, String styleName) {
        // Convention: /stories/{storyId}/{styleName}/page-1.png
        return "/stories/" + storyId + "/" + styleName + "/page-1.png";
    }
}
