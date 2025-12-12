package com.storybook.service.impl;

import com.storybook.entity.UserVoice;
import com.storybook.repository.UserVoiceRepository;
import com.storybook.service.VoiceService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class VoiceServiceImpl implements VoiceService {

    private final UserVoiceRepository userVoiceRepository;

    @Value("${storybook.stories-path:../stories}")
    private String basePath; // e.g. "stories"

    public VoiceServiceImpl(UserVoiceRepository userVoiceRepository) {
        this.userVoiceRepository = userVoiceRepository;
    }

    @Override
    public UserVoice uploadVoice(Long userId, String name, MultipartFile file) {
        try {
            // 1. Create Directory: stories/voices/{userId}
            Path voiceDir = Paths.get(basePath, "voices", String.valueOf(userId));
            if (!Files.exists(voiceDir)) {
                Files.createDirectories(voiceDir);
            }

            // 2. Save File
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
            String originalFilename = file.getOriginalFilename();
            // Sanitize filename
            if (originalFilename == null)
                originalFilename = "voice.wav";
            originalFilename = originalFilename.replaceAll("[^a-zA-Z0-9\\.\\-_]", "_");

            String filename = timestamp + "_" + originalFilename;
            Path targetPath = voiceDir.resolve(filename);
            Files.copy(file.getInputStream(), targetPath);

            // 3. Save to DB
            UserVoice voice = new UserVoice();
            voice.setUserId(userId);
            voice.setName(name);
            // Save relative path for flexibility
            voice.setFilePath("voices/" + userId + "/" + filename);
            voice.setProvider("NEUTTS_AIR");

            return userVoiceRepository.save(voice);

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload voice file", e);
        }
    }

    @Override
    public List<UserVoice> getUserVoices(Long userId) {
        return userVoiceRepository.findByUserId(userId);
    }
}
