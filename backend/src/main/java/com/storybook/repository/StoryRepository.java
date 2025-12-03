package com.storybook.repository;

import com.storybook.entity.Story;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.storybook.entity.StoryStatus;
import java.util.Optional;
import java.util.List; // Added missing import

public interface StoryRepository extends JpaRepository<Story, String> {
    // Find stories by status ordered by createdAt desc
    List<Story> findByStatusOrderByCreatedAtDesc(StoryStatus status);

    // Combined search by user, status, and title (case insensitive) ordered by createdAt desc
    List<Story> findByUserIdAndStatusAndTitleZhContainingIgnoreCaseOrUserIdAndStatusAndTitleEnContainingIgnoreCaseOrderByCreatedAtDesc(
            String userId1, StoryStatus status1, String zhKeyword,
            String userId2, StoryStatus status2, String enKeyword
    );

    // Basic search by title (case insensitive) and status PUBLISHED ordered by createdAt desc
    List<Story> findByStatusAndTitleZhContainingIgnoreCaseOrStatusAndTitleEnContainingIgnoreCaseOrderByCreatedAtDesc(
            StoryStatus status1, String zh, StoryStatus status2, String en
    );
    
    // Find stories by user ID ordered by createdAt desc
    List<Story> findByUserIdOrderByCreatedAtDesc(String userId);

    // Find stories by user ID and status ordered by createdAt desc
    List<Story> findByUserIdAndStatusOrderByCreatedAtDesc(String userId, StoryStatus status);
}
