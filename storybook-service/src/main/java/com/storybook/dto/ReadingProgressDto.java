package com.storybook.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReadingProgressDto {
    private String storyId;
    private String storyTitle; // Returned for display
    private String styleName;
    private int currentPage;
    private long durationSeconds;
    private LocalDateTime updatedAt;
}
