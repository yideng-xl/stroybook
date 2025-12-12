# ALIGNMENT: 修复服务端启动时的事务回滚错误

## 1. 问题分析

### 现状
服务端启动时报错 `org.springframework.transaction.UnexpectedRollbackException: Transaction silently rolled back because it has been marked as rollback-only`。
错误堆栈指向 `StorySyncServiceImpl.syncStories` 方法。

### 原因推断
1. `syncStories` 方法上标注了 `@Transactional`，这不仅仅开启了一个事务，而且是涵盖了整个方法执行的大事务。
2. 该方法遍历所有故事文件夹进行同步。
3. 在循环内部，虽然有 `try-catch` 块捕获了异常，但是如果被调用的 Spring Data JPA Repository 方法（或其他参与事务的方法）抛出了 `RuntimeException`，事务上下文已经被标记为 `rollback-only`。
4. 即使我们在代码中捕获了异常并打印了日志，Spring 事务管理器在方法结束尝试提交事务时，发现事务被标记为回滚，因此抛出 `UnexpectedRollbackException`。
5. 此外，将所有故事的同步放在同一个大事务中也是不合理的，如果第99个故事失败导致回滚，前98个成功的同步也会被回滚（或者如本例所示，导致整个应用启动失败）。

## 2. 解决方案

### 核心策略
**拆分事务粒度**：`syncStories` 自身不应该是一个事务，而应该作为调度者，确保每个故事的同步操作在独立的事务中进行。

### 具体修改
1. **移除** `StorySyncServiceImpl.syncStories` 方法上的 `@Transactional` 注解。
2. **提取** 循环体内的逻辑到一个新的 `public` 方法（例如 `syncSingleStoryFull`），并标注文档 `@Transactional(propagation = Propagation.REQUIRES_NEW)`。
3. **注入代理对象**：在 `StorySyncServiceImpl` 中注入自身（使用 `@Lazy` 避免循环依赖，或者使用 `AopContext`，或者简单且推荐的方式：将新方法放到该类中并通过 `self` 引用调用，需配置 self 注入）。
   - *替代方案*：由于 `syncStories` 是在启动时调用，通过 `ApplicationContext` 获取 bean 或者简单的重构可能更稳妥。
   - 或者，鉴于 `syncStoryFiles` 已经是 `public` 且 `@Transactional` 的，我们可以重用它吗？
     - `syncStories` 中的逻辑比 `syncStoryFiles` 多了一些（主要是推断 `selectedStyleId` 并创建初始 `Story` 实体）。
     - 因此，最好提取一个新的公共方法 `syncDirectoryStory(String storyId)` 包含这些额外逻辑。

### 详细设计
在 `StorySyncServiceImpl` 中：
1. 添加 `private final StorySyncServiceImpl self;` 也就是注入自身代理。（通常使用 `@Resource` 或 `@Autowired` + `@Lazy`）。
   - 或者，为了避免循环依赖问题，我们可以新建一个 helper service，但这对当前简单修复来说可能过度设计。
   - 另一种常见做法是将方法移到 `StoryService` 或直接在当前类处理。
   - **最简单的有效改动**：
     - 去掉 `syncStories` 的 `@Transactional`。
     - 将循环体内容提取为 `public void syncAndInitStory(String storyId)`。
     - 给这个新方法加上 `@Transactional(propagation = Propagation.REQUIRES_NEW)`。
     - 必须确保调用时是通过代理对象调用。由于 Spring Bean 内部调用（`this.method()`）不会触发 AOP 代理，我们需要注入自身。

### 风险评估
- 修改事务传播行为可能会影响数据一致性？在这里，每个故事独立同步是更合理的行为，降低了风险。

## 3. 任务清单
- [ ] 修改 `StorySyncServiceImpl.java`
  - 移除 `syncStories` 上的 `@Transactional`
  - 提取单故事处理逻辑到新方法 `syncStoryFromDir`
  - 添加自我注入
  - 验证修复

## 4. 疑问
无。这是一个标准的 Spring 事务陷阱。
