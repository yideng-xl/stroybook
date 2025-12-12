package com.storybook.service;

import com.storybook.dto.StoryJsonDto;
import com.storybook.entity.Story;
import com.storybook.entity.StoryStatus;
import java.util.List;
import java.util.Optional;

public interface StoryService {
    List<Story> getAllStories(String userId, String keyword);

    List<Story> getStoriesByStatus(String userId, StoryStatus status, String keyword);

    Optional<Story> getStoryById(String id);

    Optional<StoryJsonDto> getStoryDetail(String id);

    String initiateStoryGeneration(String userId, String prompt, String style, Long voiceId);

    List<Story> getUserStories(String userId);

    void redubStory(String storyId, Long voiceId, String userId);

    void handleN8NCallback(String storyId, String status, String errorMessage, String type);
}
