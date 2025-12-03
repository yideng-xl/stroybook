package com.storybook.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class StoryCallbackRequest {
    @NotBlank(message = "Story ID cannot be empty")
    private String storyId;
    
    @NotBlank(message = "Status cannot be empty")
    private String status; // "SUCCESS" or "FAILED"
    
    private String errorMessage; // Optional
}
