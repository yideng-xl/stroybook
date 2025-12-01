package com.storybook.repository;

import com.storybook.entity.StoryStyle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoryStyleRepository extends JpaRepository<StoryStyle, Long> {
}
