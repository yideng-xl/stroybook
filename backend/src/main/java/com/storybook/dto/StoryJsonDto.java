package com.storybook.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class StoryJsonDto {
    private String titleZh;
    private String titleEn;
    private String styleZh; // Default style hint
    private String styleEn;
    private String fullStory;
    private List<PageDto> pages;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PageDto {
        private int pageNumber;
        private String textZh;
        private String textEn;
    }
}
