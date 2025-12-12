package com.storybook;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class StorybookApplication {

    public static void main(String[] args) {
        SpringApplication.run(StorybookApplication.class, args);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public org.springframework.web.filter.CommonsRequestLoggingFilter requestLoggingFilter() {
        org.springframework.web.filter.CommonsRequestLoggingFilter loggingFilter = new org.springframework.web.filter.CommonsRequestLoggingFilter();
        loggingFilter.setIncludeClientInfo(true);
        loggingFilter.setIncludeQueryString(true);
        loggingFilter.setIncludePayload(true);
        loggingFilter.setMaxPayloadLength(64000);
        loggingFilter.setIncludeHeaders(false);
        return loggingFilter;
    }
}
