package com.storybook.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reading_progress")
@Data
@NoArgsConstructor
public class ReadingProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String storyId; // Weak reference to Story.id

    private String styleName; // e.g. "迪士尼"

    @Column(nullable = false)
    private Integer currentPage;

    @Column(nullable = false)
    private Long durationSeconds = 0L; // Total reading time in seconds

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public ReadingProgress(User user, String storyId, String styleName, Integer currentPage) {
        this.user = user;
        this.storyId = storyId;
        this.styleName = styleName;
        this.currentPage = currentPage;
    }
}
