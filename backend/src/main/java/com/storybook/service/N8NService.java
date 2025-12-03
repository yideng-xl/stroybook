package com.storybook.service;

public interface N8NService {
    void triggerN8NWebhook(String storyId, String prompt, String style, String userId);
}
