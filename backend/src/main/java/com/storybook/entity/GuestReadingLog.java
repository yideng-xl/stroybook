package com.storybook.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "guest_reading_logs")
@Data
@NoArgsConstructor
public class GuestReadingLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String guestId;

    @Column(nullable = false)
    private String storyId;

    @CreationTimestamp
    private LocalDateTime readAt;

    public GuestReadingLog(String guestId, String storyId) {
        this.guestId = guestId;
        this.storyId = storyId;
    }
}
