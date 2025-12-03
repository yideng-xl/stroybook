package com.storybook.service.impl;

import com.storybook.service.N8NService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class N8NServiceImpl implements N8NService {

    @Value("${storybook.n8n-webhook-url}")
    private String n8nWebhookUrl;

    private final RestTemplate restTemplate;

    @Override
    public void triggerN8NWebhook(String storyId, String prompt, String style, String userId) {
        if (n8nWebhookUrl == null || n8nWebhookUrl.isEmpty()) {
            log.error("N8N webhook URL is not configured. Cannot trigger webhook for storyId: {}", storyId);
            throw new RuntimeException("N8N webhook URL is not configured.");
        }

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("storyId", storyId);
        requestBody.put("prompt", prompt);
        requestBody.put("style", style);
        requestBody.put("userId", userId);

        try {
            log.info("Triggering N8N webhook for storyId: {}", storyId);
            restTemplate.postForLocation(n8nWebhookUrl, requestBody);
            log.info("N8N webhook successfully triggered for storyId: {}", storyId);
        } catch (Exception e) {
            log.error("Failed to trigger N8N webhook for storyId: {}. Error: {}", storyId, e.getMessage());
            throw new RuntimeException("Failed to trigger N8N webhook", e);
        }
    }
}
