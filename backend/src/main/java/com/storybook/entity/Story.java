package com.storybook.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
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
    private String id; // Use folder name as ID, e.g., "灰姑娘"

    private String titleZh;
    private String titleEn;

    private String userId; // 关联用户ID

    @Enumerated(EnumType.STRING)
    private StoryStatus status; // 新增：故事生成状态
    
    @Column(length = 1000)
    private String generationPrompt; // 新增：用户输入的原始Prompt

    private String selectedStyleId; // 新增：用户选择的风格ID
    
    @Column(length = 2000)
    private String errorMessage; // 新增：生成失败时的错误信息
    
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
