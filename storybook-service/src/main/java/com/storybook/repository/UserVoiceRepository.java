package com.storybook.repository;

import com.storybook.entity.UserVoice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserVoiceRepository extends JpaRepository<UserVoice, Long> {
    List<UserVoice> findByUserId(Long userId);
}
