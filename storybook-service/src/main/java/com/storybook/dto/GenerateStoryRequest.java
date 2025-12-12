package com.storybook.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class GenerateStoryRequest {
    @NotBlank(message = "Prompt cannot be empty")
    private String prompt;
    
    @NotBlank(message = "Style cannot be empty")
    private String style;

    // Optional: ID of the cloned voice to use
    private Long voiceId;
}