package com.storybook.repository;

import com.storybook.entity.GuestReadingLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;

public interface GuestReadingLogRepository extends JpaRepository<GuestReadingLog, Long> {
    
    @Query("SELECT COUNT(DISTINCT l.storyId) FROM GuestReadingLog l WHERE l.guestId = :guestId AND l.readAt >= :startOfDay")
    long countDistinctStoriesByGuestIdToday(String guestId, LocalDateTime startOfDay);

    boolean existsByGuestIdAndStoryIdAndReadAtAfter(String guestId, String storyId, LocalDateTime startOfDay);
}
