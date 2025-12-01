package com.storybook.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
@Slf4j
public class WebConfig implements WebMvcConfigurer {

    @Value("${storybook.stories-path:../stories}")
    private String storiesPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map /stories/** to file system
        String absolutePath = new File(storiesPath).getAbsolutePath();
        if (!absolutePath.endsWith(File.separator)) {
            absolutePath += File.separator;
        }
        
        log.info("Mapping /stories/** to file path: {}", absolutePath);
        
        registry.addResourceHandler("/stories/**")
                .addResourceLocations("file:" + absolutePath);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*") // Allow Vite dev server
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowCredentials(true);
    }
}
