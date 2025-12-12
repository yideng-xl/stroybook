package com.storybook.entity;

public enum StoryStatus {
    DRAFT,          // 草稿 (预留，MVP3暂不实现)
    GENERATING,     // 正在生成中
    PUBLISHED,      // 已发布，可阅读
    FAILED          // 生成失败
}
