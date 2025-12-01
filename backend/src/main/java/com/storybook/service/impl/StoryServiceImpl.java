package com.storybook.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storybook.dto.StoryJsonDto;
import com.storybook.entity.Story;
import com.storybook.repository.StoryRepository;
import com.storybook.service.StoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class StoryServiceImpl implements StoryService {

    private final StoryRepository storyRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${storybook.stories-path:../stories}")
    private String storiesPath;

    @Override
    public List<Story> getAllStories(String keyword) {
        if (keyword != null && !keyword.isBlank()) {
            return storyRepository.findByTitleZhContainingIgnoreCaseOrTitleEnContainingIgnoreCase(keyword, keyword);
        }
        return storyRepository.findAll();
    }

    @Override
    public Optional<Story> getStoryById(String id) {
        return storyRepository.findById(id);
    }

    @Override
    public Optional<StoryJsonDto> getStoryDetail(String id) {
        // Retrieve full content from filesystem
        File jsonFile = new File(storiesPath + "/" + id, "story.json");
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
}
