package com.storybook.service;

import com.storybook.dto.StoryJsonDto;
import com.storybook.entity.Story;
import java.util.List;
import java.util.Optional;

public interface StoryService {
    List<Story> getAllStories(String keyword);
    Optional<Story> getStoryById(String id);
    Optional<StoryJsonDto> getStoryDetail(String id);
}
