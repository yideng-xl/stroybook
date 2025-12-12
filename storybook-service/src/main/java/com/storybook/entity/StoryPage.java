package com.storybook.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "story_pages")
@Data
@NoArgsConstructor
public class StoryPage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "story_id", nullable = false)
    @JsonIgnore
    private Story story;

    private Integer pageNumber;

    @Column(length = 2000)
    private String textZh;

    @Column(length = 2000)
    private String textEn;

    private String imageUrl; // Path to the image for this page

    private String audioUrlZh; // Audio URL for Chinese text

    private String audioUrlEn; // Audio URL for English text

    // MVP5: Custom cloned voice audio URLs
    private String customAudioUrlZh;
    private String customAudioUrlEn;
}
