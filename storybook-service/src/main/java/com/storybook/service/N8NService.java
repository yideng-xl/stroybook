package com.storybook.service;

public interface N8NService {

    void triggerN8NWebhook(String storyId, String prompt, String style, String userId, String voicePath);

    void triggerRedubWebhook(String storyId, String userId, String voicePath);

}
