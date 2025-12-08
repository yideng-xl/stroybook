package com.storybook.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp; 
import org.hibernate.annotations.UpdateTimestamp; 

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "stories")
@Data
@NoArgsConstructor
public class Story {

    @Id
    @Column(nullable = false, unique = true)
    private String id; 

    private String titleZh;
    private String titleEn;

    private String userId; 

    @Enumerated(EnumType.STRING)
    private StoryStatus status; 
    
    @Column(length = 1000)
    private String generationPrompt; 

    private String selectedStyleId; 
    
    @Column(length = 2000)
    private String errorMessage; 
    
    @Column(length = 2000)
    private String description;

    @OneToMany(mappedBy = "story", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StoryStyle> styles = new ArrayList<>();

    @OneToMany(mappedBy = "story", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("pageNumber ASC")
    private List<StoryPage> pages = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
