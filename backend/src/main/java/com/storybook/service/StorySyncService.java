package com.storybook.service;

public interface StorySyncService {
    void syncStories(); // For full rescan
    void syncStoryFiles(String storyId); // For single story after N8N callback
}
