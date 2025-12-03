package com.storybook.repository;

import com.storybook.entity.StoryPage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StoryPageRepository extends JpaRepository<StoryPage, Long> {
    List<StoryPage> findByStoryIdOrderByPageNumberAsc(String storyId);
    void deleteByStoryId(String storyId); // For orphan removal
}
