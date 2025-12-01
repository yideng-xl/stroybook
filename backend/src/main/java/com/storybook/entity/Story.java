package com.storybook.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "stories")
@Data
@NoArgsConstructor
public class Story {

    @Id
    @Column(nullable = false, unique = true)
    private String id; // Use folder name as ID, e.g., "灰姑娘"

    private String titleZh;
    private String titleEn;
    
    @Column(length = 2000)
    private String description;

    @OneToMany(mappedBy = "story", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StoryStyle> styles = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
