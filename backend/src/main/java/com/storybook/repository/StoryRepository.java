package com.storybook.repository;

import com.storybook.entity.Story;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface StoryRepository extends JpaRepository<Story, String> {
    // Basic search by title (case insensitive)
    List<Story> findByTitleZhContainingIgnoreCaseOrTitleEnContainingIgnoreCase(String zh, String en);
    
    @Query("SELECT s FROM Story s JOIN s.styles st WHERE st.name = :styleName")
    List<Story> findByStyleName(String styleName);
}
