package com.storybook.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "story_styles")
@Data
@NoArgsConstructor
public class StoryStyle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "story_id", nullable = false)
    @JsonIgnore // Prevent infinite recursion in JSON
    @ToString.Exclude
    private Story story;

    @Column(nullable = false)
    private String name; // e.g., "迪士尼" (Zh)

    private String nameEn; // e.g., "Disney"

    private String coverImage; // Relative path, e.g., "/stories/灰姑娘/迪士尼/page-1.png"

    public StoryStyle(Story story, String name, String nameEn, String coverImage) {
        this.story = story;
        this.name = name;
        this.nameEn = nameEn;
        this.coverImage = coverImage;
    }
}
