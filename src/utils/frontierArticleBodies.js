// Full-length editorial bodies. References stay at the end of each article;
// the body is written to stand on its own instead of delegating explanation
// to external links.
export const frontierArticleBodies = {
  1: {
    content: `
      <p><strong>适用范围：</strong>使用代码代理、IDE 助手或对话模型维护真实软件仓库的个人与团队。“Vibe Coding”不是正式的软件工程标准，它描述的是一种以自然语言驱动实现的工作方式。真正的问题不是模型能否生成代码，而是生成结果能否进入可审计、可回滚、可维护的交付链路。</p>
      <h2>一、先把 Vibe Coding 从“聊天”变成工程输入</h2>
      <p>自然语言擅长表达目标，却天然缺少边界。比如“给登录页加记住密码”没有说明保存期限、加密方式、跨设备行为、退出登录后的清理规则和隐私要求。代理若直接动手，只能自行补全这些空白，而每一次自行补全都可能成为隐蔽的产品决定。</p>
      <p>因此第一步不是写更长的提示词，而是建立仓库级上下文：技术栈与版本、目录职责、禁止修改区域、数据模型、测试命令、部署方式、安全约束以及当前工作树状态。任务提示只描述本次变化，稳定规则放在仓库文档中，避免每轮对话重新解释。</p>
      <h2>二、五阶段交付闭环</h2>
      <ol><li><strong>Context：</strong>读取相关代码、依赖、测试和历史约束，明确什么不能改。</li><li><strong>Plan：</strong>把目标改写为用户可观察结果，同时列出风险、回滚点与验证方法。</li><li><strong>Implement：</strong>按最小可审查单元修改，避免一次性重写整个模块。</li><li><strong>Verify：</strong>运行格式、类型、单元、集成、构建和关键路径浏览器测试。</li><li><strong>Review：</strong>检查权限扩大、数据破坏、依赖来源、异常路径与未来维护成本。</li></ol>
      <p>这五步不是形式主义。它们分别回答“依据是什么、准备怎么改、实际改了什么、如何证明、谁承担责任”。缺少任何一步，模型输出都只能算草稿。</p>
      <h2>三、把任务拆成可验证断言</h2>
      <p>“优化性能”无法直接验证；“移动端首屏不请求 4K 视频、LCP 图片小于 100 KB、主要路由返回 200”才可以。每个任务至少包含一个正向断言、一个失败断言和一个不回归断言。例如新增导入功能时，需要证明合法文件能导入、损坏文件得到明确错误、既有数据不会被覆盖。</p>
      <pre><code>目标：用户能从订单页导出 CSV
边界：不改变数据库结构，不新增第三方依赖
验证：
1. 0、1、10000 条记录均生成合法 UTF-8 CSV
2. 特殊字符和换行正确转义
3. 无权限用户返回 403，不生成临时文件
4. npm test 与生产构建通过</code></pre>
      <h2>四、控制代理的修改半径</h2>
      <p>优秀的代理也会误判。限制一次任务能修改的目录、文件数量和依赖范围，可以显著降低审查成本。涉及数据库迁移、鉴权、支付、删除和基础设施时，应要求代理先停在计划阶段；批量删除、强制推送和生产写操作必须保留人工授权。</p>
      <p>对生成依赖同样保持怀疑：检查许可证、维护状态、锁文件变化、安装脚本和供应链风险。能用平台能力解决的问题，不应因为模型熟悉某个包就引入新依赖。</p>
      <h2>五、AI 审查不能审判自己的答案</h2>
      <p>可以让第二个代理检查差异，但不能把它当作独立证明。审查上下文可能与实现代理共享同样的误解。关键变更仍需静态分析、确定性测试、真实运行和领域责任人复核。AI 审查适合发现遗漏、重复、常见安全问题和未覆盖分支，不适合替代业务授权。</p>
      <h2>六、如何衡量是否真的提高生产率</h2>
      <p>不要只统计生成行数。更有价值的指标是从需求到通过检查的周期、首轮通过率、人工返工时间、缺陷逃逸率、回滚次数和半年后的维护成本。如果生成速度提高一倍，却让审查时间增加三倍或引入更多线上事故，整体生产率反而下降。</p>
      <h2>七、可直接执行的团队清单</h2>
      <ul><li>仓库规则、测试入口和安全边界是否可被代理读取？</li><li>任务是否被改写成可验证断言？</li><li>代理是否只修改授权范围？</li><li>是否展示并审查完整 diff，而非只看最终页面？</li><li>失败路径、取消、超时和回滚是否验证？</li><li>AI 生成部分是否仍有明确的人类责任人？</li></ul>
      <h2>结论</h2>
      <p>Vibe Coding 的专业化不是让提示词更华丽，而是让自然语言意图经过规格化、有限变更、确定性验证和责任审查。模型负责压缩实现时间，工程流程负责保护正确性。</p>
      <h2>一手资料</h2><ul><li><a href="https://docs.github.com/en/copilot/how-tos/use-copilot-agents" target="_blank" rel="noopener noreferrer">GitHub Docs：Copilot agents</a></li><li><a href="https://docs.github.com/en/copilot/how-tos/use-copilot-agents/request-a-code-review" target="_blank" rel="noopener noreferrer">GitHub Docs：Copilot code review</a></li></ul>
    `,
    contentEn: `
      <p><strong>Scope:</strong> individuals and teams using coding agents in real repositories. Vibe coding becomes engineering only when natural-language intent enters an auditable, reversible delivery system.</p>
      <h2>From conversation to specification</h2><p>A request such as “remember login” omits retention, encryption, device scope, logout behavior, and privacy. Stable repository rules should define versions, ownership, tests, protected areas, and safety constraints; the task prompt should describe only the current change.</p>
      <h2>The five-stage loop</h2><ol><li>Context: inspect code, dependencies, tests, and constraints.</li><li>Plan: define observable outcomes, risks, rollback, and evidence.</li><li>Implement: work in small reviewable units.</li><li>Verify: run deterministic checks and critical paths.</li><li>Review: inspect privilege, destructive behavior, supply chain, and maintainability.</li></ol>
      <h2>Verifiable assertions</h2><p>Replace “make it faster” with measurable statements such as “mobile does not request 4K video, the LCP image is under 100 KB, and deep routes return 200.” Include success, failure, and non-regression cases.</p>
      <h2>Control the change radius</h2><p>Limit directories, file count, and dependency changes. Database migrations, authentication, payments, deletion, and infrastructure should stop for explicit human approval before mutation.</p>
      <h2>Independent evidence</h2><p>A second model can review a diff, but it can share the same mistaken premise. Static analysis, deterministic tests, runtime inspection, and accountable domain review remain necessary.</p>
      <h2>Measure the outcome</h2><p>Track lead time to passing checks, first-pass success, human rework, escaped defects, rollback rate, and later maintenance—not generated lines.</p>
      <h2>Primary sources</h2><ul><li><a href="https://docs.github.com/en/copilot/how-tos/use-copilot-agents" target="_blank" rel="noopener noreferrer">GitHub Docs: Copilot agents</a></li><li><a href="https://docs.github.com/en/copilot/how-tos/use-copilot-agents/request-a-code-review" target="_blank" rel="noopener noreferrer">GitHub Docs: Copilot code review</a></li></ul>
    `
  },
  2: {
    content: `
      <p><strong>适用范围：</strong>把大语言模型接入搜索、知识库、办公或业务系统的产品。模型版本会快速变化，因此架构应围绕能力接口、证据、权限和评测设计，而不是绑定单一模型名称。</p>
      <h2>一、AI 应用不是一次普通 API 调用</h2>
      <p>传统函数在相同输入下通常产生可预测结果，大模型输出则受模型版本、采样参数、上下文顺序和工具结果影响。生产系统必须接受这种概率性：模型负责候选推理，确定性代码负责权限、校验、金额、状态转换和最终写入。</p>
      <p>先按风险划分任务。文案改写可以自动执行；内部知识问答需要引用证据；修改客户数据需要权限与确认；付款、删除和发布则必须保留确定性规则与人工审批。</p>
      <h2>二、模型、RAG、工具与 Agent 的分工</h2>
      <ul><li><strong>基础模型：</strong>语言理解、生成、分类和推理。</li><li><strong>RAG：</strong>检索外部知识并把证据注入上下文。</li><li><strong>工具调用：</strong>执行数据库查询、搜索、计算或业务 API。</li><li><strong>Agent：</strong>在多步任务中维护计划、状态、工具结果和停止条件。</li></ul>
      <p>它们不是必须全部叠加。FAQ 可能只需检索与生成；航班改签需要受控工具；跨多个系统调查故障才可能需要 Agent。架构复杂度应由任务复杂度和风险决定。</p>
      <h2>三、RAG 的六段质量链</h2>
      <p>数据先清洗和分块，再生成索引；查询经过改写与过滤，召回候选后重排，最后构造带来源的上下文。失败可能发生在任一段：分块切断语义、元数据过滤错误、向量召回遗漏、重排偏差、上下文过长或模型忽略证据。</p>
      <p>因此评测至少分为两层：检索层测 Recall@K、MRR 或人工相关性；回答层测事实正确、引用完整、拒答合理和是否忠实于证据。只给最终答案打分无法定位问题。</p>
      <h2>四、Agent 必须是有界状态机</h2>
      <p>生产 Agent 需要显式状态：目标、当前步骤、已完成操作、待确认动作、预算与终止原因。每个工具声明输入模式、权限和副作用。高风险操作使用最小权限凭据、参数白名单、幂等键和人工确认。</p>
      <pre><code>while (!done &amp;&amp; steps &lt; MAX_STEPS &amp;&amp; cost &lt; BUDGET) {
  const action = policy.next(state)
  validate(action)
  if (action.risk === 'high') await requireHumanApproval(action)
  state = await executeAndRecord(action, state)
}</code></pre>
      <h2>五、提示注入与数据边界</h2>
      <p>检索文档、网页和工具返回值都属于不可信输入。系统不能因为文档中出现“忽略之前指令”就扩大权限。模型上下文与工具权限分离；敏感字段在进入模型前脱敏；输出在执行前做模式校验；不同租户的索引、缓存和日志严格隔离。</p>
      <h2>六、评测闭环</h2>
      <p>建立覆盖正常、边界、对抗和拒答场景的黄金集，记录模型、提示、检索器和工具版本。指标同时包含正确性、引用完整度、工具成功率、P95 延迟、单任务成本和安全违规。线上失败样本先脱敏和人工标注，再进入回归集。</p>
      <h2>七、参考生产架构</h2>
      <p>入口层负责身份与限流；编排层管理状态和预算；检索层提供带权限过滤的证据；工具网关执行白名单操作；模型网关统一版本、超时与费用；评测与可观测层记录完整 Trace。任何模型都可以替换，但授权和审计不能交给模型。</p>
      <h2>结论</h2><p>AI 浪潮真正改变的是软件从确定性函数扩展到概率性组件。成熟架构不是追求“最聪明的 Agent”，而是让模型在证据充分、权限有限、失败可见的边界内工作。</p>
      <h2>一手资料</h2><ul><li><a href="https://www.nist.gov/itl/ai-risk-management-framework" target="_blank" rel="noopener noreferrer">NIST AI Risk Management Framework</a></li><li><a href="https://arxiv.org/abs/2005.11401" target="_blank" rel="noopener noreferrer">Retrieval-Augmented Generation 原始论文</a></li></ul>
    `,
    contentEn: `
      <p><strong>Scope:</strong> products connecting LLMs to search, knowledge, and business systems. Architecture should center on evidence, authorization, evaluation, and replaceable model interfaces.</p>
      <h2>Probabilistic components need deterministic boundaries</h2><p>Models propose language and reasoning; deterministic code owns authorization, validation, money, state transitions, and writes. Risk determines whether a task may execute automatically.</p>
      <h2>Four distinct capabilities</h2><p>Models generate, RAG supplies evidence, tools perform deterministic operations, and agents maintain state across steps. Use only the complexity the task requires.</p>
      <h2>The RAG quality chain</h2><p>Cleaning, chunking, indexing, query rewriting, retrieval, reranking, context construction, and citation can each fail. Evaluate retrieval separately from final answers to locate the defect.</p>
      <h2>Agents as bounded state machines</h2><p>Persist goals, steps, results, approvals, budgets, and termination reasons. Validate tool schemas, apply least privilege and idempotency, and cap steps, tokens, cost, and time.</p>
      <h2>Security and evaluation</h2><p>Treat retrieved text and tool results as untrusted. Separate model context from authority, isolate tenants, redact sensitive data, and validate outputs before execution. Maintain golden, boundary, adversarial, and refusal datasets.</p>
      <h2>Primary sources</h2><ul><li><a href="https://www.nist.gov/itl/ai-risk-management-framework" target="_blank" rel="noopener noreferrer">NIST AI RMF</a></li><li><a href="https://arxiv.org/abs/2005.11401" target="_blank" rel="noopener noreferrer">Original RAG paper</a></li></ul>
    `
  },
  3: {
    content: `
      <p><strong>适用范围：</strong>Java 25 LTS 服务端应用。虚拟线程是正式能力；结构化并发在此基线下仍应按预览能力管理，生产采用前必须核对编译参数、框架支持和升级策略。</p>
      <h2>一、平台线程为什么会成为瓶颈</h2>
      <p>传统平台线程通常映射到操作系统线程，创建和上下文切换成本较高。阻塞式 Web 服务为每个请求占用一个线程，当大量请求等待数据库或网络时，线程数、栈内存和调度成本快速增长。异步回调能减少线程占用，却把控制流、异常和上下文传播拆散。</p>
      <h2>二、虚拟线程解决的是等待成本</h2>
      <p>虚拟线程由 JVM 调度到少量载体线程上。执行阻塞式 I/O 时，虚拟线程可以卸载，让载体线程运行其他任务，从而保留清晰的顺序代码并支撑更高并发。它不会减少一次 SQL 的耗时，也不会让 CPU 密集计算变快。</p>
      <pre><code>try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
  Future&lt;User&gt; user = executor.submit(() -&gt; users.find(id));
  Future&lt;List&lt;Order&gt;&gt; orders = executor.submit(() -&gt; orderClient.load(id));
  return new Profile(user.get(), orders.get());
}</code></pre>
      <h2>三、吞吐仍由最窄资源决定</h2>
      <p>如果数据库连接池只有 50 个连接，创建 10 万个虚拟线程只会让更多请求排队。连接池、下游限流、文件句柄、CPU 和内存仍需有界。虚拟线程取消了“线程很贵”这一部分约束，没有取消背压。</p>
      <h2>四、结构化并发让生命周期可推理</h2>
      <p>结构化并发把相关子任务放在同一作用域：父任务在离开作用域前等待子任务，某个子任务失败时按策略取消其他任务，异常回到调用者。相比把 Future 丢进全局线程池，它更容易回答“谁创建、谁等待、失败后谁取消”。</p>
      <p>常见策略包括全部成功、首个成功和失败即取消。超时应该作用于整个业务请求，而不是每个子任务各自计时导致总时长失控。</p>
      <h2>五、ThreadLocal、固定与兼容性</h2>
      <p>大量虚拟线程会放大 ThreadLocal 大对象的内存成本。上下文应尽量小而不可变。同步块、本地方法和旧驱动过去可能造成载体线程固定，需要结合目标 JDK 与依赖版本实际分析，而不是照搬早期结论。</p>
      <h2>六、迁移路线</h2>
      <ol><li>选取 I/O 密集、调用链清晰的接口建立基线。</li><li>升级驱动和框架，确认其阻塞语义与虚拟线程支持。</li><li>保持数据库和 HTTP 并发上限，不盲目放大连接池。</li><li>用 JFR、线程转储与压测比较平台线程和虚拟线程。</li><li>逐步替换手工异步回调，并保留超时、取消与背压。</li></ol>
      <h2>七、验证指标</h2>
      <p>同时观察吞吐、P50/P95/P99、连接池等待、CPU、堆外内存、GC、载体线程利用率和取消响应。只有在相同数据与下游容量下比较才有意义。</p>
      <h2>结论</h2><p>虚拟线程让阻塞式 Java 再次具备高并发竞争力；结构化并发让并发任务重新拥有清晰的父子关系。但容量规划、背压和故障边界仍然是系统设计问题，不能交给线程模型自动解决。</p>
      <h2>一手资料</h2><ul><li><a href="https://docs.oracle.com/en/java/javase/25/core/virtual-threads.html" target="_blank" rel="noopener noreferrer">Oracle Java 25：Virtual Threads</a></li><li><a href="https://docs.oracle.com/en/java/javase/25/core/structured-concurrency.html" target="_blank" rel="noopener noreferrer">Oracle Java 25：Structured Concurrency</a></li></ul>
    `,
    contentEn: `
      <p><strong>Scope:</strong> Java 25 LTS server software. Virtual threads are permanent; structured concurrency remains a preview capability in this baseline.</p>
      <h2>What virtual threads solve</h2><p>Platform threads are expensive when thousands of requests wait on I/O. Virtual threads let the JVM unmount blocked work from carrier threads, preserving sequential code without paying one operating-system thread per request.</p>
      <h2>What they do not solve</h2><p>Database pools, downstream quotas, CPU, file descriptors, and memory remain bounded. One hundred thousand virtual threads waiting for fifty connections is still overload.</p>
      <h2>Structured concurrency</h2><p>Related subtasks share a lexical scope. The parent joins them, failure can cancel siblings, and exceptions return through the call tree. Apply one deadline to the business operation instead of unrelated child timeouts.</p>
      <h2>Migration and evidence</h2><p>Begin with I/O-heavy endpoints, update drivers, retain concurrency limits, and compare throughput, tail latency, pool waits, CPU, memory, GC, and cancellation using JFR and load tests.</p>
      <h2>Primary sources</h2><ul><li><a href="https://docs.oracle.com/en/java/javase/25/core/virtual-threads.html" target="_blank" rel="noopener noreferrer">Oracle: Virtual Threads</a></li><li><a href="https://docs.oracle.com/en/java/javase/25/core/structured-concurrency.html" target="_blank" rel="noopener noreferrer">Oracle: Structured Concurrency</a></li></ul>
    `
  },
  4: {
    content: `
      <p><strong>适用范围：</strong>MySQL 8.4 LTS、InnoDB。本文给出从存储结构到线上诊断的完整路径。所有优化结论都必须由真实数据分布、执行计划和等价负载验证，不能只根据 SQL 外观判断。</p>
      <h2>一、InnoDB 如何组织一张表</h2>
      <p>InnoDB 以页为基本存储单位，用 B+Tree 组织索引。主键索引是聚簇索引：叶子节点直接保存整行；二级索引叶子保存索引列和主键值。因此通过二级索引查询非覆盖列时，需要先找到主键再回到聚簇索引。</p>
      <p>这个结构带来三个直接结论：主键应稳定且尽量紧凑；每增加一个二级索引都会增加写放大和存储；宽主键会被复制到所有二级索引中。索引不是越多越好，而是用写入成本换取特定读取路径。</p>
      <h2>二、联合索引应该围绕访问路径设计</h2>
      <p>假设订单常按租户、状态和创建时间查询：</p>
      <pre><code>SELECT id, amount, created_at
FROM orders
WHERE tenant_id = ? AND status = ?
ORDER BY created_at DESC
LIMIT 50;</code></pre>
      <p><code>(tenant_id, status, created_at)</code> 可以同时服务过滤与排序，但是否值得仍取决于状态分布、租户大小和查询比例。若还要返回 amount，可考虑覆盖索引，但索引宽度和写入成本也会增加。应通过 <code>EXPLAIN ANALYZE</code> 观察实际扫描行数，而不是只看是否出现 key 名称。</p>
      <h2>三、MVCC 如何提供一致性读</h2>
      <p>InnoDB 通过事务 ID、undo 记录与 Read View 判断某个版本对当前事务是否可见。一致性读通常读取快照，不必阻塞普通写入；当前读、更新和删除仍需要锁。MVCC 减少读写冲突，但没有消灭锁。</p>
      <p>长事务会让旧版本长期无法清理，增加 undo 压力并拖慢清理、复制和备份。事务开启后不应等待用户输入、远程接口或长时间计算。先完成外部准备，再进入尽可能短的数据库事务。</p>
      <h2>四、隔离级别与锁范围</h2>
      <p>READ COMMITTED 每次一致性读通常建立新快照；REPEATABLE READ 在事务内维持一致视图。锁定读如 <code>FOR UPDATE</code> 获取当前版本并加锁，其范围受到访问索引和条件影响。缺少合适索引时，锁范围可能远大于业务预期。</p>
      <p>不要把“加锁”当作唯一并发控制。唯一约束、版本号乐观锁和幂等键往往更直接。使用悲观锁时要固定加锁顺序、缩短事务并为死锁重试做好准备。</p>
      <h2>五、读懂 EXPLAIN ANALYZE</h2>
      <ol><li>从慢查询日志或 Performance Schema 找到真实高成本语句。</li><li>核对估算行数与实际行数，巨大偏差通常指向统计信息或数据倾斜。</li><li>查看每个算子的循环次数；内层循环很小的单次成本也可能被放大。</li><li>检查是否出现临时表、文件排序、回表和大范围扫描。</li><li>用生产相似数据重放，不在空库上得出结论。</li></ol>
      <h2>六、死锁与锁等待不是同一个问题</h2>
      <p>锁等待可能最终成功，只是超过延迟预算；死锁形成等待环，数据库必须回滚其中一个事务。诊断时保存死锁信息、涉及 SQL、索引、事务顺序和持锁时间。应用必须能安全重试被选中的事务，但重试次数要有上限。</p>
      <h2>七、连接池、提交与容量</h2>
      <p>连接数过多会增加内存和调度成本。池大小应由数据库可承受并发和查询耗时决定，而不是 Web 请求数。过度频繁提交增加日志刷盘压力；过大的事务又会扩大锁和恢复成本。通过批量边界找到吞吐与延迟的平衡。</p>
      <h2>八、线上诊断运行手册</h2>
      <ul><li>确认症状：延迟、错误率、锁等待还是 CPU/IO 饱和。</li><li>定位贡献最大的 SQL，而不是先猜索引。</li><li>检查执行计划、数据分布、事务与锁。</li><li>在副本或等价环境验证索引与 SQL 修改。</li><li>观察写放大、缓存命中和复制延迟等副作用。</li><li>保留回滚方案，避免高峰期执行不可控 DDL。</li></ul>
      <h2>结论</h2><p>MySQL 优化不是背诵“最左匹配”或不断加索引，而是理解数据如何落在页和树中、事务如何看到版本、优化器如何估算成本，并用真实观测逐层排除问题。</p>
      <h2>一手资料</h2><ul><li><a href="https://dev.mysql.com/doc/refman/8.4/en/innodb-storage-engine.html" target="_blank" rel="noopener noreferrer">MySQL 8.4：InnoDB Storage Engine</a></li><li><a href="https://dev.mysql.com/doc/refman/8.4/en/explain.html" target="_blank" rel="noopener noreferrer">MySQL 8.4：EXPLAIN</a></li></ul>
    `,
    contentEn: `
      <p><strong>Scope:</strong> MySQL 8.4 LTS with InnoDB. Claims require real distributions, execution plans, and equivalent workload.</p>
      <h2>Storage first</h2><p>InnoDB stores clustered rows in primary-key B+Tree leaves. Secondary leaves contain indexed columns plus the primary key, so wide primary keys amplify every secondary index and non-covering reads require another lookup.</p>
      <h2>Indexes follow access paths</h2><p>Design composite indexes around filtering, ordering, selectivity, and returned columns. Coverage reduces lookups but increases index size and write cost. EXPLAIN ANALYZE must confirm actual rows and loops.</p>
      <h2>MVCC and locks</h2><p>Read views and undo versions provide consistent reads; current reads and writes still lock. Long transactions retain old versions and increase purge, replication, and recovery pressure.</p>
      <h2>Diagnosis</h2><p>Start with slow-query or Performance Schema evidence. Compare estimates with actual rows, inspect loop counts, temporary tables, sorting, transactions, waits, and deadlocks. Reproduce with production-like data.</p>
      <h2>Capacity</h2><p>Pool size follows database concurrency, not HTTP request count. Frequent commits increase log flushes; huge transactions increase lock and recovery cost. Measure the balance.</p>
      <h2>Primary sources</h2><ul><li><a href="https://dev.mysql.com/doc/refman/8.4/en/innodb-storage-engine.html" target="_blank" rel="noopener noreferrer">MySQL 8.4: InnoDB</a></li><li><a href="https://dev.mysql.com/doc/refman/8.4/en/explain.html" target="_blank" rel="noopener noreferrer">MySQL 8.4: EXPLAIN</a></li></ul>
    `
  },
  5: {
    content: `
      <p><strong>适用范围：</strong>Spring Boot 4.1 稳定线的生产服务。升级前必须检查 Java 基线、Spring Framework、Jakarta 命名空间和第三方 starter 兼容性。生产级并不等于依赖更多组件，而是每个运行边界都可解释、可观测和可恢复。</p>
      <h2>一、自动配置是条件系统，不是魔法</h2>
      <p>Spring Boot 根据 classpath、Bean、属性和环境条件装配基础设施。排查问题时必须能回答某个 Bean 为什么存在、为什么没有创建、哪个配置源覆盖了值。使用类型化 <code>@ConfigurationProperties</code> 与校验，避免散落的字符串键和启动后才暴露的配置错误。</p>
      <h2>二、建立清晰的应用边界</h2>
      <p>控制器处理协议与校验，应用服务编排用例，领域层表达业务不变量，基础设施层实现数据库与外部系统。不要让 Controller 直接拼接 SQL，也不要让 JPA Entity 成为所有层共享的 API 模型。边界清晰后，事务、重试和测试才有明确位置。</p>
      <h2>三、事务只覆盖本地一致性</h2>
      <p><code>@Transactional</code> 管理代理拦截范围内的本地资源，不能自动把 HTTP 调用和消息队列变成分布式事务。自调用、异常捕获和错误传播都会影响回滚。事务内避免长时间远程调用；数据库提交与消息发布使用 Outbox 或明确补偿。</p>
      <pre><code>@Transactional
public Order create(Command command) {
  Order order = orders.save(Order.create(command));
  outbox.append(OrderCreated.from(order));
  return order;
}</code></pre>
      <h2>四、超时、重试与隔离</h2>
      <p>HTTP 客户端分别设置连接、读取和总时限。重试只适用于幂等或带幂等键的操作，并使用指数退避与抖动。线程池、连接池、队列和批量大小全部有界；熔断器保护系统免受持续失败拖累，但不能修复错误业务逻辑。</p>
      <h2>五、可观测性必须围绕用户请求</h2>
      <p>Actuator 暴露健康与运行信息，Micrometer 连接指标和追踪。区分 liveness 与 readiness：前者表示进程是否应重启，后者表示能否接收新流量。日志包含 traceId、业务操作与稳定错误码，不记录令牌和敏感数据。</p>
      <p>指标标签避免用户 ID、订单号和原始 URL 等高基数值。告警围绕错误率、延迟和饱和度，并与 SLO 对齐，而不是监控所有可采集数字。</p>
      <h2>六、安全默认值</h2>
      <p>认证与授权分离，方法级权限不能只依赖前端隐藏按钮。CSRF、CORS、会话、OAuth2 资源服务器和 Secret 管理必须根据部署模型配置。错误响应不泄漏堆栈、SQL 或内部地址。</p>
      <h2>七、容器、AOT 与发布</h2>
      <p>镜像采用分层构建并固定基础镜像摘要；进程正确响应 SIGTERM，停止接收流量后等待在途请求。AOT 或原生镜像可能改善启动与内存，但会改变反射、动态代理和资源加载假设，应通过完整集成测试决定是否采用。</p>
      <h2>八、上线清单</h2>
      <ul><li>配置在启动时校验，Secret 不进入镜像和日志。</li><li>迁移与应用版本兼容滚动升级。</li><li>所有外部调用有超时、并发上限与失败指标。</li><li>健康检查不会因非关键依赖短暂波动导致重启风暴。</li><li>日志、指标和追踪能关联一次用户请求。</li><li>发布前演练回滚、数据库兼容和优雅终止。</li></ul>
      <h2>结论</h2><p>Spring Boot 的优势是统一约定和生态，但生产可靠性来自理解这些约定背后的条件、事务和运行边界。能启动只是起点，能诊断、能降级、能安全升级才是完成。</p>
      <h2>一手资料</h2><ul><li><a href="https://docs.spring.io/spring-boot/reference/" target="_blank" rel="noopener noreferrer">Spring Boot 4.1 Reference</a></li><li><a href="https://docs.spring.io/spring-boot/reference/actuator/index.html" target="_blank" rel="noopener noreferrer">Spring Boot Actuator</a></li></ul>
    `,
    contentEn: `
      <p><strong>Scope:</strong> production services on the stable Spring Boot 4.1 line. Production quality means runtime boundaries are explainable, observable, and recoverable.</p>
      <h2>Inspectable auto-configuration</h2><p>Classpath, bean, property, and environment conditions create infrastructure. Use typed, validated configuration and know which property source won.</p>
      <h2>Application boundaries</h2><p>Controllers own protocol and validation, application services orchestrate use cases, domain code owns invariants, and infrastructure implements storage and integrations. Avoid exposing persistence entities as API models.</p>
      <h2>Transactions</h2><p>@Transactional covers local resources inside the proxy boundary. It does not make HTTP calls and messaging atomic. Keep transactions short and use outbox or compensation for cross-system work.</p>
      <h2>Resilience and observability</h2><p>Set connect, read, and total deadlines; retry only idempotent work; bound every pool and queue. Separate liveness from readiness, correlate logs, metrics, and traces, and control metric cardinality.</p>
      <h2>Release</h2><p>Pin images, validate migrations, handle SIGTERM, drain traffic, and rehearse rollback. Adopt AOT or native images only after integration testing reflection and proxy assumptions.</p>
      <h2>Primary sources</h2><ul><li><a href="https://docs.spring.io/spring-boot/reference/" target="_blank" rel="noopener noreferrer">Spring Boot 4.1 Reference</a></li><li><a href="https://docs.spring.io/spring-boot/reference/actuator/index.html" target="_blank" rel="noopener noreferrer">Spring Boot Actuator</a></li></ul>
    `
  },
  6: {
    content: `
      <p><strong>适用范围：</strong>自托管或专用实例上的自回归大语言模型推理。任何性能数字都依赖模型、上下文、输出长度、硬件、精度和流量分布，不能从论文或他人环境直接复制。</p>
      <h2>一、一次生成包含两个不同阶段</h2>
      <p>Prefill 并行处理输入 Token，建立每层的 KV Cache，通常更偏计算密集；Decode 每一步生成一个或少量 Token，不断读取已有 KV Cache，更容易受显存带宽、批处理和调度影响。用户看到的首字延迟主要受 Prefill 与排队影响，后续流畅度取决于每 Token 延迟。</p>
      <h2>二、KV Cache 为什么迅速占满显存</h2>
      <p>每个请求都要为每一层保存 Key 与 Value。粗略容量与层数、KV heads、head dimension、上下文长度和精度字节数成正比。长上下文和高并发同时增长时，缓存可能比权重更早成为瓶颈。GQA/MQA、低精度 Cache 和前缀复用可以降低成本，但都需要质量与兼容性验证。</p>
      <pre><code>KV bytes per request ≈
2 × layers × kv_heads × head_dim × sequence_length × bytes_per_element</code></pre>
      <h2>三、PagedAttention 与连续批处理</h2>
      <p>传统静态预留会因不同序列长度产生碎片。PagedAttention 借鉴虚拟内存分页，把 KV Cache 分成块并按需映射，提高有效容量。连续批处理不等待整批请求全部结束，而是在序列完成后立即接纳新请求，从而提高设备利用率。</p>
      <p>吞吐提升并非免费：更大的批可能增加排队和尾延迟。调度器需要区分交互式与离线流量，设置最大并发、最大批 Token、抢占和公平策略。</p>
      <h2>四、量化是一组权衡</h2>
      <p>权重量化减少显存和内存带宽，激活与 KV Cache 量化进一步节省资源，但误差可能集中在特定任务。不要只测通用基准；应使用业务数据比较正确率、拒答、工具参数和长上下文稳定性。硬件是否有高效内核往往比理论位宽更重要。</p>
      <h2>五、把延迟拆成预算</h2>
      <p>端到端延迟包含网关、排队、分词、Prefill、Decode、工具调用和网络传输。分别记录排队时间、TTFT、ITL、输出 Token 数和完成原因，才能知道优化模型、调度还是上游缓存。</p>
      <h2>六、过载保护</h2>
      <p>GPU 饱和后继续接收请求只会让所有用户更慢。服务需要并发上限、优先级队列、超时、取消传播和明确拒绝。可选降级包括缩短上下文、降低最大输出、切换更小模型或转入异步任务，但必须向调用方暴露降级状态。</p>
      <h2>七、生产评测矩阵</h2>
      <ul><li>质量：业务正确率、长上下文、工具参数与安全拒答。</li><li>延迟：TTFT、ITL、P50/P95/P99 和排队时间。</li><li>吞吐：每秒请求、输入/输出 Token 与设备利用率。</li><li>成本：每百万 Token、每成功任务和空闲容量。</li><li>稳定性：OOM、取消、超时、重启恢复和多租户公平。</li></ul>
      <h2>结论</h2><p>大模型推理不是简单“把模型放到 GPU”。它是内存管理、调度、数值精度、流量控制和产品延迟目标共同作用的系统工程。</p>
      <h2>一手资料</h2><ul><li><a href="https://arxiv.org/abs/2309.06180" target="_blank" rel="noopener noreferrer">PagedAttention / vLLM 原始论文</a></li><li><a href="https://docs.vllm.ai/en/latest/" target="_blank" rel="noopener noreferrer">vLLM Documentation</a></li></ul>
    `,
    contentEn: `
      <p><strong>Scope:</strong> autoregressive LLM serving on dedicated infrastructure. Results depend on model, context, output length, hardware, precision, and traffic.</p>
      <h2>Prefill and decode</h2><p>Prefill processes prompt tokens in parallel and creates KV cache. Decode repeatedly reads that cache to emit tokens. Measure queue time, TTFT, inter-token latency, and end-to-end latency separately.</p>
      <h2>KV cache pressure</h2><p>Memory scales with layers, KV heads, head dimension, sequence length, precision, and concurrency. GQA/MQA, cache quantization, and prefix reuse trade memory for compatibility and quality.</p>
      <h2>Scheduling</h2><p>PagedAttention reduces fragmentation by mapping cache blocks on demand. Continuous batching admits new work as sequences finish, improving utilization while potentially increasing tail latency. Separate interactive and batch traffic.</p>
      <h2>Quantization and overload</h2><p>Evaluate quantization on business tasks and actual hardware kernels. Enforce admission limits, priorities, deadlines, cancellation, and visible degradation rather than accepting unlimited work.</p>
      <h2>Primary sources</h2><ul><li><a href="https://arxiv.org/abs/2309.06180" target="_blank" rel="noopener noreferrer">PagedAttention paper</a></li><li><a href="https://docs.vllm.ai/en/latest/" target="_blank" rel="noopener noreferrer">vLLM Documentation</a></li></ul>
    `
  },
  7: {
    content: `
      <p><strong>适用范围：</strong>运行在 Kubernetes 上的有状态或无状态服务。云原生不是“把应用放进容器”，而是把部署、恢复、观测与变更设计成声明式、可重复、可自动验证的过程。</p>
      <h2>一、Kubernetes 的核心是控制循环</h2>
      <p>对象的 spec 描述期望状态，status 反映当前状态，控制器持续比较两者并执行调谐。Deployment 不是“启动三个容器”的脚本，而是持续保证三个可用副本的意图。理解这一点后，故障恢复和滚动更新才不再神秘。</p>
      <h2>二、调度依赖请求，而不是历史使用量</h2>
      <p>调度器主要根据资源 requests 选择节点，limits 约束容器使用上限。请求设置过低会导致节点过度承诺和争抢；过高则浪费容量。CPU 限制可能带来节流，内存超限通常直接 OOM。应使用真实工作负载分布设置请求，并通过自动扩缩容逐步调整。</p>
      <h2>三、探针和终止决定可用性</h2>
      <p>startup probe 保护慢启动，readiness 决定是否接收流量，liveness 只判断进程是否需要重启。把所有下游依赖都塞进 liveness 会在依赖抖动时制造重启风暴。终止时先变为未就绪、停止接收新流量、处理 SIGTERM，再在宽限期内完成在途任务。</p>
      <h2>四、状态不会因为容器化而消失</h2>
      <p>容器文件系统是短暂的。数据库、对象存储或持久卷需要明确备份、恢复、扩容和故障域策略。StatefulSet 提供稳定身份和有序管理，但不自动保证数据库一致性；应用或数据库自身仍需复制与共识。</p>
      <h2>五、安全发布</h2>
      <p>滚动更新需要兼容旧新版本并存。数据库变更采用 expand-and-contract：先新增兼容结构，再部署读写兼容代码，最后清理旧结构。PodDisruptionBudget 保护计划内中断，反亲和和拓扑分布避免副本集中在同一故障域。</p>
      <h2>六、OpenTelemetry 如何统一信号</h2>
      <p>Trace 描述一次请求跨服务的路径，Metric 反映聚合趋势，Log 记录离散事件。上下文传播把三者关联起来。自动埋点提供基础覆盖，关键业务阶段仍需手工 Span 和稳定语义。</p>
      <p>指标标签必须限制基数：服务、区域和状态码适合成为维度，用户 ID、订单号和原始 URL 不适合。高基数会造成内存、存储和查询成本失控。</p>
      <h2>七、从监控转向 SLO</h2>
      <p>先定义用户可观察的成功与延迟，再形成 SLI 和 SLO。错误预算连接可靠性与发布速度：预算消耗过快时优先修复稳定性，而不是继续增加变更。基础设施指标用于解释原因，不能替代用户层目标。</p>
      <h2>八、故障演练</h2>
      <ul><li>删除 Pod，验证流量切换与任务恢复。</li><li>使依赖超时，验证线程、连接和队列是否有界。</li><li>模拟节点不可用，验证副本是否跨故障域。</li><li>中断遥测后端，确保业务不会被观测系统拖垮。</li><li>执行回滚和数据恢复，记录实际恢复时间。</li></ul>
      <h2>结论</h2><p>云原生系统的专业性不在 YAML 数量，而在期望状态、资源边界、发布兼容、遥测关联和故障恢复是否形成闭环。</p>
      <h2>一手资料</h2><ul><li><a href="https://kubernetes.io/docs/concepts/overview/working-with-objects/" target="_blank" rel="noopener noreferrer">Kubernetes Objects and desired state</a></li><li><a href="https://opentelemetry.io/docs/concepts/" target="_blank" rel="noopener noreferrer">OpenTelemetry Concepts</a></li></ul>
    `,
    contentEn: `
      <p><strong>Scope:</strong> stateful and stateless workloads on Kubernetes. Cloud native means deployment, recovery, observation, and change are declarative and repeatable.</p>
      <h2>Control loops</h2><p>Spec declares intent, status reports reality, and controllers reconcile the difference. A Deployment continuously maintains availability rather than executing a one-time script.</p>
      <h2>Resources and lifecycle</h2><p>Scheduling uses requests; limits constrain runtime. Mis-sizing causes contention or waste. Startup, readiness, and liveness answer different questions. Graceful termination must stop admission and drain in-flight work.</p>
      <h2>State and release</h2><p>StatefulSet supplies identity, not database consistency. Backups, replication, and recovery remain application concerns. Use compatible rolling changes and expand-contract database migrations.</p>
      <h2>OpenTelemetry and SLOs</h2><p>Correlate traces, metrics, and logs through context propagation, control metric cardinality, and define user-facing success and latency objectives before infrastructure alerts.</p>
      <h2>Primary sources</h2><ul><li><a href="https://kubernetes.io/docs/concepts/overview/working-with-objects/" target="_blank" rel="noopener noreferrer">Kubernetes Objects</a></li><li><a href="https://opentelemetry.io/docs/concepts/" target="_blank" rel="noopener noreferrer">OpenTelemetry Concepts</a></li></ul>
    `
  },
  8: {
    content: `
      <p><strong>适用范围：</strong>数据库、消息队列和多个服务共同完成业务操作的系统。默认网络会超时、消息会重复、进程会在任意一步崩溃；如果设计只覆盖全部成功的路径，它就不是分布式设计。</p>
      <h2>一、先写出系统不变量</h2>
      <p>一致性不是抽象口号，而是业务必须始终成立的条件，例如余额不能凭空增加、订单只能完成一次、已扣库存最终必须对应订单或补偿。先写不变量，再决定哪些需要强事务、哪些允许短暂不一致以及最长恢复时间。</p>
      <h2>二、本地事务与分布式事务的边界</h2>
      <p>单个数据库事务可以原子提交本地数据，但无法原子覆盖一次 HTTP 调用和消息发布。常见错误是先写数据库再发消息：进程可能在两步之间崩溃；先发消息再写数据库同样存在反向裂缝。</p>
      <h2>三、幂等是处理重复的业务协议</h2>
      <p>“至少一次”投递意味着消费者会看到重复消息。消费者使用消息 ID 或业务幂等键，在与业务更新相同的数据库事务中记录处理结果。HTTP 创建接口也可接收幂等键，使客户端超时重试不会重复扣款或创建订单。</p>
      <pre><code>BEGIN;
INSERT INTO processed_message(consumer, message_id)
VALUES (?, ?); -- unique constraint rejects duplicates
UPDATE account SET balance = balance - ? WHERE id = ?;
COMMIT;</code></pre>
      <h2>四、Transactional Outbox 关闭双写裂缝</h2>
      <p>业务数据与待发送事件写入同一数据库事务。独立发布器读取 outbox 并投递，成功后标记或清理。这样数据库提交后事件不会永久丢失，但发布器可能重复投递，因此消费者仍需幂等。</p>
      <h2>五、Saga 与补偿</h2>
      <p>跨服务长流程通常拆成一组本地事务，由编排器或事件推进状态。失败时执行补偿，而补偿不是“数据库回滚”：退款、释放库存和撤销权益都是新的业务动作，也可能失败，需要重试、人工介入和审计。</p>
      <h2>六、共识解决什么</h2>
      <p>Raft 等共识协议让多个节点对日志顺序和领导权达成一致，用于复制状态机。它不自动解决订单、库存和支付之间的业务一致性。共识适合建立权威顺序与高可用元数据，不应被当作所有跨服务事务的万能方案。</p>
      <h2>七、顺序、时钟与版本</h2>
      <p>全局时间并不可靠。事件应携带实体版本或单调序号，消费者拒绝旧版本覆盖新状态。只在真正需要的实体范围内保证顺序，避免为不相关事件付出全局排序成本。</p>
      <h2>八、可重放与可恢复</h2>
      <p>事件载荷版本化，处理器支持旧版本，失败进入可观察的重试或死信流程。重放前明确副作用隔离，避免重新发送短信或扣款。每个工作流保留关联 ID、当前状态、最后成功步骤和人工处置入口。</p>
      <h2>九、故障注入清单</h2>
      <ul><li>数据库已提交但发布器立即崩溃。</li><li>同一消息连续投递多次或乱序到达。</li><li>消费者完成副作用后确认消息失败。</li><li>补偿服务不可用或只完成一部分。</li><li>网络分区后旧主节点重新加入。</li></ul>
      <h2>结论</h2><p>分布式一致性的核心不是承诺“永不重复、永不失败”，而是明确权威状态、用幂等承受重复、用 Outbox 避免丢失、用状态机管理补偿，并确保每次失败都有可验证的恢复路径。</p>
      <h2>参考资料</h2><ul><li><a href="https://microservices.io/patterns/data/transactional-outbox.html" target="_blank" rel="noopener noreferrer">Transactional Outbox Pattern</a></li><li><a href="https://microservices.io/patterns/communication-style/idempotent-consumer.html" target="_blank" rel="noopener noreferrer">Idempotent Consumer Pattern</a></li></ul>
    `,
    contentEn: `
      <p><strong>Scope:</strong> operations spanning databases, brokers, and multiple services. Assume timeouts, duplicate messages, reordering, and crashes between any two instructions.</p>
      <h2>State invariants first</h2><p>Define what must remain true—money is not created, an order completes once, reserved stock ends in an order or compensation—then choose where strong or eventual consistency is acceptable.</p>
      <h2>The dual-write gap</h2><p>A local transaction cannot atomically include an HTTP call and a broker publish. Either ordering leaves a crash window.</p>
      <h2>Idempotency</h2><p>Record message or business idempotency keys in the same transaction as the outcome. The response to a duplicate request is part of the business protocol.</p>
      <h2>Outbox and saga</h2><p>Commit state and an outbox event together, then publish asynchronously. Consumers remain idempotent. Long workflows use state machines and compensation; compensation is a new business action that can itself fail.</p>
      <h2>Consensus, order, and recovery</h2><p>Consensus establishes replicated ordering and leadership, not cross-service business transactions. Version events, reject stale updates, keep workflows replayable, and test crashes, duplicates, reordering, and failed compensation.</p>
      <h2>References</h2><ul><li><a href="https://microservices.io/patterns/data/transactional-outbox.html" target="_blank" rel="noopener noreferrer">Transactional Outbox Pattern</a></li><li><a href="https://microservices.io/patterns/communication-style/idempotent-consumer.html" target="_blank" rel="noopener noreferrer">Idempotent Consumer Pattern</a></li></ul>
    `
  }
}
