// Curated technical archive. Each entry states its scope and links to primary
// documentation or original research so the article can be checked and
// updated as the underlying platform evolves.
export const frontierArticles = {
  1: {
    builtInRevision: 3,
    translationOverride: true,
    date: '2026-08-01',
    category: 'AI 工程',
    categoryEn: 'AI Engineering',
    readTime: 16,
    readTimeEn: 16,
    title: 'Vibe Coding 工程化：从自然语言意图到可审计的软件交付',
    titleEn: 'Engineering Vibe Coding: From Natural-Language Intent to Auditable Delivery',
    excerpt: 'Vibe Coding 不是“让模型随便写代码”。本文把 AI 编程拆成上下文、计划、实现、验证与审查五个可追踪阶段，建立适用于真实仓库的质量与安全边界。',
    excerptEn: 'Vibe coding is not permission for a model to improvise unchecked. This article turns AI-assisted development into five traceable stages: context, plan, implementation, verification, and review.',
    content: `
      <p><strong>适用范围：</strong>使用代码代理、IDE 助手或对话模型维护真实软件仓库的团队。“Vibe Coding”并不是正式的软件工程标准，本文讨论的是如何把这种交互方式纳入可审计的交付流程。</p>
      <h2>提示词不是规格，生成结果也不是证据</h2>
      <p>自然语言可以快速表达意图，却常常省略兼容性、数据迁移、权限、性能和失败恢复。可靠流程必须先让代理读取仓库约束、测试入口和变更边界，再形成可验证计划。任何“看起来合理”的实现都只是候选方案，只有差异检查、测试和运行证据才能支撑合并。</p>
      <h2>五阶段工作流</h2>
      <ol><li><strong>Context：</strong>限定目录、版本、架构规则与不可修改区域。</li><li><strong>Plan：</strong>写明用户可观察结果、风险、回滚点和验证方法。</li><li><strong>Implement：</strong>保持小批次变更，避免一次改写整个模块。</li><li><strong>Verify：</strong>运行格式、类型、单元、集成与关键路径测试。</li><li><strong>Review：</strong>检查权限扩大、数据破坏、依赖变更和生成代码的维护成本。</li></ol>
      <h2>AI 代码审查的正确位置</h2>
      <p>代理可以发现重复、遗漏和常见缺陷，但不能代替责任人审批。自动审查应作为额外信号，不能绕过分支保护、必需检查或领域专家。仓库级指令应定义安全清单和测试要求，而不是只规定代码风格。</p>
      <h2>验收指标</h2>
      <p>记录首轮通过率、人工返工量、缺陷逃逸率、测试覆盖的关键行为以及回滚次数。速度提升如果伴随更高的审查成本或线上事故，就不是生产率提升。</p>
      <h2>一手资料</h2>
      <ul><li><a href="https://docs.github.com/en/copilot/how-tos/use-copilot-agents" target="_blank" rel="noopener noreferrer">GitHub Docs：Copilot agents</a></li><li><a href="https://docs.github.com/en/copilot/how-tos/use-copilot-agents/request-a-code-review" target="_blank" rel="noopener noreferrer">GitHub Docs：Copilot code review</a></li></ul>
    `,
    contentEn: `
      <p><strong>Scope:</strong> teams using coding agents, IDE assistants, or chat models in real repositories. “Vibe coding” is not a formal engineering standard; this article explains how to place the interaction inside an auditable delivery process.</p>
      <h2>A prompt is not a specification</h2><p>Natural language compresses intent but often omits compatibility, migration, authorization, performance, and recovery constraints. A reliable agent first reads repository rules and test entry points, then proposes a verifiable plan. Generated code is a candidate; diffs, tests, and runtime evidence justify a merge.</p>
      <h2>Five stages</h2><ol><li>Context: define scope, versions, and protected areas.</li><li>Plan: state observable outcomes, risks, rollback points, and checks.</li><li>Implement: make small, reviewable changes.</li><li>Verify: run formatting, typing, unit, integration, and critical-path tests.</li><li>Review: inspect privileges, destructive behavior, dependencies, and maintainability.</li></ol>
      <h2>Where AI review belongs</h2><p>Agent review is an additional signal, not a substitute for accountable approval. It must not bypass branch protection, required checks, or domain experts.</p>
      <h2>Primary sources</h2><ul><li><a href="https://docs.github.com/en/copilot/how-tos/use-copilot-agents" target="_blank" rel="noopener noreferrer">GitHub Docs: Copilot agents</a></li><li><a href="https://docs.github.com/en/copilot/how-tos/use-copilot-agents/request-a-code-review" target="_blank" rel="noopener noreferrer">GitHub Docs: Copilot code review</a></li></ul>
    `
  },
  2: {
    builtInRevision: 3,
    translationOverride: true,
    date: '2026-07-28',
    category: 'AI 系统',
    categoryEn: 'AI Systems',
    readTime: 18,
    readTimeEn: 18,
    title: 'AI 浪潮下的软件架构：模型、RAG、Agent 与评测体系',
    titleEn: 'Software Architecture in the AI Wave: Models, RAG, Agents, and Evaluation',
    excerpt: '从模型能力边界出发，分析 RAG、工具调用与 Agent 工作流的适用场景，并建立覆盖质量、成本、延迟、安全和可追溯性的评测闭环。',
    excerptEn: 'Start from model limits, then decide where RAG, tool use, and agent workflows belong. Build an evaluation loop covering quality, cost, latency, safety, and traceability.',
    content: `
      <p><strong>适用范围：</strong>把大语言模型接入搜索、知识库、办公或业务系统的产品。模型版本会快速变化，因此架构应围绕能力接口、证据和评测设计，而不是绑定单一模型名称。</p>
      <h2>先区分四种能力</h2>
      <p>基础模型负责生成与推理；RAG 为回答提供外部证据；工具调用执行确定性操作；Agent 则在多步任务中维护计划与状态。它们不是递进式“高级功能”：一个可检索回答不一定需要 Agent，一次转账也绝不能只依赖模型自由生成参数。</p>
      <h2>RAG 的真正边界</h2>
      <p>RAG 质量由切分、索引、召回、重排、上下文构造和答案引用共同决定。必须分别评估检索命中与最终回答，否则无法判断失败来自知识缺失、召回错误还是模型没有忠实使用证据。</p>
      <h2>Agent 的控制面</h2>
      <p>高风险工具采用最小权限、参数校验、幂等键和人工确认；每一步保留输入、工具结果、模型决策和版本。为循环次数、Token、费用和执行时间设置硬上限，并允许取消和恢复。</p>
      <h2>评测不是上线前的一张表</h2>
      <p>建立代表真实任务的黄金集，持续跟踪正确性、引用完整度、工具成功率、P95 延迟、单任务成本和安全拒绝。线上反馈先进入隔离样本库，再由人工确认是否成为回归用例。</p>
      <h2>一手资料</h2>
      <ul><li><a href="https://www.nist.gov/itl/ai-risk-management-framework" target="_blank" rel="noopener noreferrer">NIST AI Risk Management Framework</a></li><li><a href="https://arxiv.org/abs/2005.11401" target="_blank" rel="noopener noreferrer">Retrieval-Augmented Generation 原始论文</a></li></ul>
    `,
    contentEn: `
      <p><strong>Scope:</strong> products connecting language models to search, knowledge, office, or business systems. Model releases change quickly, so architecture should center on capability interfaces, evidence, and evaluation rather than one model name.</p>
      <h2>Separate four capabilities</h2><p>A foundation model generates; RAG supplies external evidence; tools execute deterministic actions; an agent maintains state across multiple steps. They are not a maturity ladder. A grounded answer may not need an agent, while a financial action must never trust freely generated parameters.</p>
      <h2>RAG boundaries</h2><p>Quality depends on chunking, indexing, retrieval, reranking, context construction, and citation. Measure retrieval and answer quality separately.</p>
      <h2>Agent control plane</h2><p>Apply least privilege, validation, idempotency, human approval, complete traces, and hard limits for steps, tokens, money, and time.</p>
      <h2>Primary sources</h2><ul><li><a href="https://www.nist.gov/itl/ai-risk-management-framework" target="_blank" rel="noopener noreferrer">NIST AI Risk Management Framework</a></li><li><a href="https://arxiv.org/abs/2005.11401" target="_blank" rel="noopener noreferrer">Original RAG paper</a></li></ul>
    `
  },
  3: {
    builtInRevision: 3,
    translationOverride: true,
    date: '2026-07-24',
    category: 'Java',
    categoryEn: 'Java',
    readTime: 16,
    readTimeEn: 16,
    title: '现代 Java 并发：虚拟线程、结构化并发与性能边界',
    titleEn: 'Modern Java Concurrency: Virtual Threads, Structured Concurrency, and Limits',
    excerpt: '以 Java 25 为稳定基线，解释虚拟线程适合解决什么、结构化并发如何传播失败与取消，以及为什么吞吐提升仍受数据库、连接池和外部服务约束。',
    excerptEn: 'Using Java 25 as the baseline, explain what virtual threads solve, how structured concurrency propagates failure and cancellation, and why databases and downstream services still cap throughput.',
    content: `
      <p><strong>适用范围：</strong>Java 25 LTS 服务端应用。虚拟线程是正式能力；结构化并发在该版本仍需按预览能力管理，生产采用前必须核对编译参数与升级策略。</p>
      <h2>虚拟线程优化等待，不消除资源上限</h2>
      <p>虚拟线程让“每请求一线程”的阻塞代码以更低线程成本扩展，尤其适合大量网络和数据库等待。它不会让 CPU 密集任务自动变快，也不会扩大数据库连接池、下游限流或内存容量。</p>
      <pre><code>try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
  var future = executor.submit(() -&gt; repository.load(id));
  return future.get();
}</code></pre>
      <h2>结构化并发管理任务生命周期</h2>
      <p>相关子任务被限制在同一个作用域中：父任务结束前等待子任务，失败时按策略取消同组任务，异常不会悄悄遗留在线程池。它改善的是取消、错误传播与可观测性，而不只是语法。</p>
      <h2>性能验证</h2>
      <p>用 JFR、线程转储和端到端压测观察固定并发下的吞吐、P95/P99 延迟、连接等待和内存。避免在线程本地变量中保存大对象，并检查任何会固定载体线程的本地调用或兼容性代码。</p>
      <h2>一手资料</h2><ul><li><a href="https://docs.oracle.com/en/java/javase/25/core/virtual-threads.html" target="_blank" rel="noopener noreferrer">Oracle Java 25：Virtual Threads</a></li><li><a href="https://docs.oracle.com/en/java/javase/25/core/structured-concurrency.html" target="_blank" rel="noopener noreferrer">Oracle Java 25：Structured Concurrency</a></li></ul>
    `,
    contentEn: `
      <p><strong>Scope:</strong> Java 25 LTS server applications. Virtual threads are permanent; structured concurrency must still be managed as a preview feature in this baseline.</p>
      <h2>Virtual threads optimize waiting</h2><p>They make thread-per-request code scale with lower thread overhead, particularly for network and database waits. They do not accelerate CPU-bound work or expand connection pools and downstream quotas.</p>
      <h2>Structured task lifetime</h2><p>Related subtasks live in one scope, are joined before the parent proceeds, and can propagate failure and cancellation as a unit. The benefit is lifecycle, error handling, and observability.</p>
      <h2>Primary sources</h2><ul><li><a href="https://docs.oracle.com/en/java/javase/25/core/virtual-threads.html" target="_blank" rel="noopener noreferrer">Oracle Java 25: Virtual Threads</a></li><li><a href="https://docs.oracle.com/en/java/javase/25/core/structured-concurrency.html" target="_blank" rel="noopener noreferrer">Oracle Java 25: Structured Concurrency</a></li></ul>
    `
  },
  4: {
    builtInRevision: 3,
    translationOverride: true,
    date: '2026-07-20',
    category: '数据库',
    categoryEn: 'Database',
    readTime: 18,
    readTimeEn: 18,
    title: 'MySQL 8.4 LTS：MVCC、索引、执行计划与事务诊断',
    titleEn: 'MySQL 8.4 LTS: MVCC, Indexes, Execution Plans, and Transaction Diagnosis',
    excerpt: '从 InnoDB 的聚簇索引和多版本并发控制出发，建立慢查询、锁等待、死锁与事务边界的诊断顺序，并说明何时索引反而增加成本。',
    excerptEn: 'Start with InnoDB clustered indexes and MVCC, then build a disciplined process for diagnosing slow queries, lock waits, deadlocks, and transaction boundaries.',
    content: `
      <p><strong>适用范围：</strong>MySQL 8.4 LTS、InnoDB。所有优化结论必须通过真实数据分布、执行计划和负载验证，不能只根据 SQL 外观判断。</p>
      <h2>从存储结构理解索引</h2>
      <p>InnoDB 的主键索引是聚簇索引，叶子节点保存整行；二级索引叶子保存索引列与主键值。宽主键会放大每个二级索引，低选择性索引可能让优化器选择全表扫描。联合索引应围绕过滤、排序和回表成本设计。</p>
      <h2>MVCC 与锁不是互斥概念</h2>
      <p>一致性读通过 Read View 与 undo 版本读取快照；当前读和写操作仍需要锁。长事务会延长旧版本存活、增加清理压力，并让复制与备份复杂化。使用 <code>SELECT ... FOR UPDATE</code> 前必须明确被锁定的索引范围。</p>
      <h2>诊断顺序</h2>
      <ol><li>用慢查询与 Performance Schema 找到真实高成本语句。</li><li>查看 <code>EXPLAIN ANALYZE</code> 的实际行数、循环次数与耗时。</li><li>核对统计信息、索引选择、临时表与排序。</li><li>检查事务持续时间、锁等待与死锁记录。</li><li>以相同数据规模重放，比较修改前后的 P95 与资源消耗。</li></ol>
      <h2>一手资料</h2><ul><li><a href="https://dev.mysql.com/doc/refman/8.4/en/innodb-storage-engine.html" target="_blank" rel="noopener noreferrer">MySQL 8.4：InnoDB Storage Engine</a></li><li><a href="https://dev.mysql.com/doc/refman/8.4/en/explain.html" target="_blank" rel="noopener noreferrer">MySQL 8.4：EXPLAIN</a></li></ul>
    `,
    contentEn: `
      <p><strong>Scope:</strong> MySQL 8.4 LTS with InnoDB. Every optimization claim must be tested against real distributions, plans, and workload.</p>
      <h2>Indexes begin with storage</h2><p>The primary-key B-tree is clustered; secondary leaves contain indexed values plus the primary key. Wide keys amplify every secondary index, while low selectivity can make a scan cheaper.</p>
      <h2>MVCC still has locks</h2><p>Consistent reads use read views and undo versions; current reads and writes still lock. Long transactions retain old versions and increase purge, replication, and recovery pressure.</p>
      <h2>Diagnosis</h2><p>Start from slow-query evidence, inspect EXPLAIN ANALYZE, validate statistics and row counts, then inspect transaction duration, waits, and deadlocks. Compare P95 latency and resource use under equivalent data.</p>
      <h2>Primary sources</h2><ul><li><a href="https://dev.mysql.com/doc/refman/8.4/en/innodb-storage-engine.html" target="_blank" rel="noopener noreferrer">MySQL 8.4: InnoDB</a></li><li><a href="https://dev.mysql.com/doc/refman/8.4/en/explain.html" target="_blank" rel="noopener noreferrer">MySQL 8.4: EXPLAIN</a></li></ul>
    `
  },
  5: {
    builtInRevision: 3,
    translationOverride: true,
    date: '2026-07-16',
    category: 'Spring',
    categoryEn: 'Spring',
    readTime: 17,
    readTimeEn: 17,
    title: 'Spring Boot 4.1 生产级架构：配置、可观测性与故障边界',
    titleEn: 'Production Architecture with Spring Boot 4.1: Configuration, Observability, and Failure Boundaries',
    excerpt: '围绕 Spring Boot 4.1 的自动配置、外部化配置、Actuator、Micrometer 与容器部署，说明如何让服务可启动、可诊断、可降级并可安全升级。',
    excerptEn: 'Use Spring Boot 4.1 auto-configuration, externalized configuration, Actuator, Micrometer, and containers to build services that are diagnosable, degradable, and safely upgradeable.',
    content: `
      <p><strong>适用范围：</strong>Spring Boot 4.1 稳定线。升级前必须检查 Java 基线、Spring Framework 版本、Jakarta 命名空间与第三方 starter 兼容性。</p>
      <h2>自动配置不是魔法</h2>
      <p>自动配置根据 classpath、Bean 和属性条件装配组件。生产问题排查应能回答“哪个条件创建了这个 Bean、哪个配置源覆盖了值”。使用配置属性类和校验替代散落的字符串读取，对密钥使用专门的 Secret 管理。</p>
      <h2>把故障限制在边界内</h2>
      <p>HTTP 客户端设置连接、读取与总超时；重试只用于可安全重放的操作，并配合退避、抖动和幂等键。线程池、连接池和队列都必须有界，降级结果应与正常结果在类型和监控上可区分。</p>
      <h2>可观测性与发布</h2>
      <p>Actuator 提供健康与运行端点，Micrometer 负责指标与追踪桥接。健康检查区分存活和就绪，指标避免把用户 ID 放入标签造成高基数。容器镜像固定依赖和基础镜像摘要，并在发布前验证迁移、滚动升级和回滚。</p>
      <h2>一手资料</h2><ul><li><a href="https://docs.spring.io/spring-boot/reference/" target="_blank" rel="noopener noreferrer">Spring Boot 4.1 Reference</a></li><li><a href="https://docs.spring.io/spring-boot/reference/actuator/index.html" target="_blank" rel="noopener noreferrer">Spring Boot Actuator</a></li></ul>
    `,
    contentEn: `
      <p><strong>Scope:</strong> the stable Spring Boot 4.1 line. Before upgrading, verify the Java baseline, Spring Framework, Jakarta namespaces, and third-party starters.</p>
      <h2>Auto-configuration is inspectable</h2><p>Conditions based on the classpath, beans, and properties create infrastructure. Production diagnosis must identify which condition created a bean and which property source won.</p>
      <h2>Bound failure</h2><p>Set connection, read, and total timeouts. Retry only safely replayable work with backoff, jitter, and idempotency. Pools and queues must be bounded.</p>
      <h2>Observe and release</h2><p>Use Actuator health endpoints and Micrometer telemetry, separate liveness from readiness, control metric cardinality, and validate migrations, rolling upgrades, and rollback.</p>
      <h2>Primary sources</h2><ul><li><a href="https://docs.spring.io/spring-boot/reference/" target="_blank" rel="noopener noreferrer">Spring Boot 4.1 Reference</a></li><li><a href="https://docs.spring.io/spring-boot/reference/actuator/index.html" target="_blank" rel="noopener noreferrer">Spring Boot Actuator</a></li></ul>
    `
  },
  6: {
    builtInRevision: 3,
    translationOverride: true,
    date: '2026-07-12',
    category: '大模型系统',
    categoryEn: 'ML Systems',
    readTime: 18,
    readTimeEn: 18,
    title: '大模型推理工程：KV Cache、批处理、量化与延迟预算',
    titleEn: 'LLM Inference Engineering: KV Cache, Batching, Quantization, and Latency Budgets',
    excerpt: '从 prefill 与 decode 两阶段出发，解释 KV Cache 为什么主导显存，连续批处理和 PagedAttention 如何提高吞吐，以及量化带来的质量与硬件权衡。',
    excerptEn: 'Start with prefill and decode, then examine why KV cache dominates memory, how continuous batching and PagedAttention improve throughput, and what quantization trades away.',
    content: `
      <p><strong>适用范围：</strong>自托管或专用实例上的自回归大语言模型推理。任何吞吐数字都依赖模型、上下文长度、硬件、精度和流量分布，不能跨环境直接比较。</p>
      <h2>Prefill 与 Decode 是两种负载</h2>
      <p>Prefill 并行处理输入 Token，通常更偏计算密集；Decode 每一步只生成少量 Token，却不断读取 KV Cache，更容易受显存带宽和调度影响。应分别记录 TTFT、每输出 Token 延迟和完整请求时延。</p>
      <h2>KV Cache 与连续批处理</h2>
      <p>KV Cache 随层数、上下文和并发增长。静态预留会产生碎片，PagedAttention 借鉴虚拟内存分页管理缓存块；连续批处理则在请求完成后立即填入新请求，提高设备利用率，但可能让尾延迟恶化。</p>
      <h2>量化与服务目标</h2>
      <p>权重量化减少显存和带宽，但不同模型、任务和硬件的精度损失不同。先定义质量阈值、P95/P99 延迟、吞吐和成本，再选择精度、最大上下文、批大小和并发策略。过载时应排队、拒绝或降级，而不是无限扩大批次。</p>
      <h2>一手资料</h2><ul><li><a href="https://arxiv.org/abs/2309.06180" target="_blank" rel="noopener noreferrer">PagedAttention / vLLM 原始论文</a></li><li><a href="https://docs.vllm.ai/en/latest/" target="_blank" rel="noopener noreferrer">vLLM Documentation</a></li></ul>
    `,
    contentEn: `
      <p><strong>Scope:</strong> autoregressive LLM serving on self-hosted or dedicated infrastructure. Throughput numbers depend on model, context, hardware, precision, and traffic distribution.</p>
      <h2>Prefill and decode differ</h2><p>Prefill processes prompt tokens in parallel and is often compute-heavy. Decode repeatedly reads KV cache and is commonly sensitive to memory bandwidth and scheduling. Measure TTFT, inter-token latency, and end-to-end latency separately.</p>
      <h2>KV cache and batching</h2><p>PagedAttention manages cache blocks like virtual-memory pages; continuous batching admits work as other requests finish. Both improve utilization but can worsen tail latency without admission control.</p>
      <h2>Primary sources</h2><ul><li><a href="https://arxiv.org/abs/2309.06180" target="_blank" rel="noopener noreferrer">PagedAttention / vLLM paper</a></li><li><a href="https://docs.vllm.ai/en/latest/" target="_blank" rel="noopener noreferrer">vLLM Documentation</a></li></ul>
    `
  },
  7: {
    builtInRevision: 3,
    translationOverride: true,
    date: '2026-07-08',
    category: '云原生',
    categoryEn: 'Cloud Native',
    readTime: 16,
    readTimeEn: 16,
    title: '云原生系统设计：Kubernetes 控制循环与 OpenTelemetry',
    titleEn: 'Cloud-Native System Design: Kubernetes Control Loops and OpenTelemetry',
    excerpt: '从 Kubernetes 的期望状态与控制循环理解调度和自愈，再用 OpenTelemetry 统一追踪、指标和日志，建立面向 SLO 的运行体系。',
    excerptEn: 'Understand scheduling and recovery through Kubernetes desired state and control loops, then use OpenTelemetry signals to operate services against explicit SLOs.',
    content: `
      <p><strong>适用范围：</strong>运行在 Kubernetes 上的有状态或无状态服务。云原生不是“把应用放进容器”，而是把部署、恢复、观测和变更都设计成声明式、可重复过程。</p>
      <h2>控制循环是核心抽象</h2>
      <p>对象的 spec 描述期望状态，status 反映当前状态，控制器持续缩小两者差异。请求和限制影响调度与隔离；探针、优雅终止、PodDisruptionBudget 和滚动策略共同决定升级期间是否保持服务。</p>
      <h2>不要把瞬时文件系统当数据库</h2>
      <p>容器可以随时重建，持久数据必须进入数据库、对象存储或明确的持久卷。服务需要处理重复启动、终止信号、连接排空和正在执行任务的恢复。</p>
      <h2>三类遥测信号</h2>
      <p>Trace 解释单次请求路径，Metric 观察聚合趋势，Log 记录离散事件。OpenTelemetry 通过上下文传播关联信号；指标标签必须限制基数，原始 URL、用户 ID 和请求 ID 不应直接成为维度。</p>
      <h2>一手资料</h2><ul><li><a href="https://kubernetes.io/docs/concepts/overview/working-with-objects/" target="_blank" rel="noopener noreferrer">Kubernetes Objects and desired state</a></li><li><a href="https://opentelemetry.io/docs/concepts/" target="_blank" rel="noopener noreferrer">OpenTelemetry Concepts</a></li></ul>
    `,
    contentEn: `
      <p><strong>Scope:</strong> stateless and stateful workloads on Kubernetes. Cloud native means deployment, recovery, observation, and change are declarative and repeatable—not merely containerized.</p>
      <h2>Control loops</h2><p>The spec declares desired state, status reports current state, and controllers continuously reconcile the difference. Resources, probes, graceful shutdown, disruption budgets, and rollout policy jointly determine availability.</p>
      <h2>Telemetry signals</h2><p>Traces explain request paths, metrics show aggregate trends, and logs record events. OpenTelemetry correlates them through context propagation; metric attributes require strict cardinality control.</p>
      <h2>Primary sources</h2><ul><li><a href="https://kubernetes.io/docs/concepts/overview/working-with-objects/" target="_blank" rel="noopener noreferrer">Kubernetes Objects</a></li><li><a href="https://opentelemetry.io/docs/concepts/" target="_blank" rel="noopener noreferrer">OpenTelemetry Concepts</a></li></ul>
    `
  },
  8: {
    builtInRevision: 3,
    translationOverride: true,
    date: '2026-07-04',
    category: '分布式系统',
    categoryEn: 'Distributed Systems',
    readTime: 17,
    readTimeEn: 17,
    title: '分布式一致性实践：幂等、Outbox、共识与故障恢复',
    titleEn: 'Distributed Consistency in Practice: Idempotency, Outbox, Consensus, and Recovery',
    excerpt: '从网络不可靠和重复投递的现实出发，区分事务原子性、消息一致性与共识问题，并用幂等键、Transactional Outbox 和可重放事件构建恢复路径。',
    excerptEn: 'Start from unreliable networks and duplicate delivery. Separate database atomicity, messaging consistency, and consensus, then design recovery with idempotency, outbox, and replayable events.',
    content: `
      <p><strong>适用范围：</strong>数据库、消息队列和多个服务共同完成业务操作的系统。本文默认网络会超时、消息会重复、进程会在任意一步崩溃。</p>
      <h2>“Exactly once”需要定义观察范围</h2>
      <p>消息系统可以降低重复概率或在自身边界内去重，但业务副作用仍可能重复执行。消费者应使用消息 ID 或业务幂等键，在同一数据库事务中记录处理结果；支付、库存等操作还要定义重复请求返回什么。</p>
      <h2>Transactional Outbox</h2>
      <p>业务数据与待发送事件写入同一数据库事务，由独立发布器把 outbox 记录投递到消息系统。它避免“数据库已提交但消息没发出”的双写裂缝，但消费者仍必须幂等，发布器也需要重试与清理策略。</p>
      <h2>不要把共识用在所有地方</h2>
      <p>共识协议解决多个节点对顺序和领导权达成一致，不等于跨服务自动获得业务事务。大多数业务流程更适合补偿、状态机和可重放事件。设计文档必须写明每个状态的权威来源以及部分失败后的恢复动作。</p>
      <h2>故障演练</h2>
      <p>主动注入超时、重复消息、乱序、发布器重启和数据库故障，验证不变量、积压恢复时间和人工处置流程。没有经过故障重放验证的一致性方案仍只是推测。</p>
      <h2>参考资料</h2><ul><li><a href="https://microservices.io/patterns/data/transactional-outbox.html" target="_blank" rel="noopener noreferrer">Transactional Outbox Pattern</a></li><li><a href="https://microservices.io/patterns/communication-style/idempotent-consumer.html" target="_blank" rel="noopener noreferrer">Idempotent Consumer Pattern</a></li></ul>
    `,
    contentEn: `
      <p><strong>Scope:</strong> operations spanning databases, queues, and multiple services. Assume networks time out, messages repeat, and processes can crash between any two steps.</p>
      <h2>Define the boundary of “exactly once”</h2><p>A broker may deduplicate within its own boundary, but business side effects can still repeat. Consumers need message or business idempotency keys recorded in the same database transaction as the outcome.</p>
      <h2>Transactional outbox</h2><p>Write business state and an outgoing event atomically, then let a publisher deliver outbox rows. This closes the database/message dual-write gap, but publishers still retry and consumers remain idempotent.</p>
      <h2>Consensus is not a business transaction</h2><p>Consensus establishes ordering and leadership among nodes. Cross-service workflows usually need state machines, compensation, and replayable events with an explicit source of truth.</p>
      <h2>References</h2><ul><li><a href="https://microservices.io/patterns/data/transactional-outbox.html" target="_blank" rel="noopener noreferrer">Transactional Outbox Pattern</a></li><li><a href="https://microservices.io/patterns/communication-style/idempotent-consumer.html" target="_blank" rel="noopener noreferrer">Idempotent Consumer Pattern</a></li></ul>
    `
  }
}
