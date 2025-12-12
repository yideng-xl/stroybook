# DESIGN & TASK: Fix Transaction Rollback in Story Sync

## 设计概要
1. **Remove Transaction from Orchestrator**: `syncStories` loses `@Transactional`.
2. **Isolate Story Processing**: Extract logic loop to `syncAndInitializeStory(String storyId)`.
3. **Ensure Independence**: `syncAndInitializeStory` gets `@Transactional(propagation = Propagation.REQUIRES_NEW)`.
4. **Self-Invocation Handling**: Inject `StorySyncServiceImpl` (or interface) into itself to allow calling the transactional method from within `syncStories`.

## 任务分解
1. **修改 StorySyncServiceImpl.java**
   - 引入 `@Autowired @Lazy private StorySyncService self;` (使用接口类型更佳，但实现类也行，只要主要是代理)。
   - 移除 `syncStories` 的 `@Transactional`。
   - 实现 `public void syncAndInitializeStory(String storyId)`。
   - 在 `syncStories` 循环中调用 `self.syncAndInitializeStory(storyId)`。
   - 捕获 `self.syncAndInitializeStory` 的所有异常，记录由于该故事失败，但不中断循环。

## 依赖图
StorySyncServiceImpl.java -> (Self Injection) -> Transaction Proxy -> DB

