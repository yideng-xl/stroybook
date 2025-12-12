package com.storybook.service;

import com.storybook.entity.UserVoice;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface VoiceService {
    UserVoice uploadVoice(Long userId, String name, MultipartFile file);
    List<UserVoice> getUserVoices(Long userId);
}
