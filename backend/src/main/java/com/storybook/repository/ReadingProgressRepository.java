package com.storybook.repository;

import com.storybook.entity.ReadingProgress;
import com.storybook.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ReadingProgressRepository extends JpaRepository<ReadingProgress, Long> {
    Optional<ReadingProgress> findByUserAndStoryId(User user, String storyId);
    List<ReadingProgress> findByUserOrderByUpdatedAtDesc(User user);
}
