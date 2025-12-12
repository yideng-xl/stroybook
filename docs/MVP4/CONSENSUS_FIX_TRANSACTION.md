# CONSENSUS: 修复服务端启动时的事务回滚错误

## 1. 需求描述
修复 Spring Boot 启动时 `StorySyncServiceImpl.syncStories` 抛出的 `UnexpectedRollbackException`。确保由于单个故事同步失败（抛出异常）不会导致整个应用启动失败，也不会回滚其他已经成功的同步操作。

## 2. 技术方案
1. **重构事务边界**：
   - `syncStories` 方法将不再开启事务。它将作为编排器。
   - 提取一个新的公共方法 `processSingleStorySync(String storyId)`，包含原循环体内的逻辑。
   - 该新方法标注 `@Transactional(propagation = Propagation.REQUIRES_NEW)`，确保每个故事在独立事务中运行，且异常处理后互不影响。

2. **解决自调用失效问题**：
   - 鉴于 `StorySyncServiceImpl` 使用了 Lombok 的 `@RequiredArgsConstructor`，我们将使用 `Setter` 注入或 `ApplicationContext` 查找来获取当前 Bean 的代理对象，以实现自调用时的 AOP 拦截。
   - 或者，更简单但略微 "dirty" 的方法：如果是单例且无循环依赖链，可以使用 `@Autowired` 字段注入自身（Spring 三级缓存通常能处理 Setter/Field 注入的循环依赖，但构造器注入不行）。
   - **决定**：修改 `@RequiredArgsConstructor` 为显式构造器（或者保留它），并添加一个字段注入 `self`。由于 `@RequiredArgsConstructor` 会包含 `final` 字段，我们可以添加一个非 final 的字段用 `@Autowired` 注入。

## 3. 验收标准
- [ ] 服务端成功启动，无 `UnexpectedRollbackException`。
- [ ] 应用日志显示 "Full story synchronization completed."。
- [ ] 单个损坏的故事数据能够记录错误日志，但不影响其他故事。

