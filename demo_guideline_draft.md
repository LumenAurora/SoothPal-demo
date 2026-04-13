为了在比赛中“震慑”评委，你的Demo必须做到三点：**极简的交互（人体涂抹）、专业的视觉风格（医疗蓝）、即时的AI反馈（演示Agent能力）**。

我为你准备了一个针对 **Cursor (Composer功能)** 或 **Bolt.new / v0.dev** 的“超级提示词”。这些工具能直接帮你生成完整的前端代码。

### 使用建议
1.  **推荐工具：** 强烈建议使用 [v0.dev](https://v0.dev/) (Vercel出品，生成UI效果最惊艳) 或 [Bolt.new](https://bolt.new/) (能运行完整代码)。
2.  **操作步骤：** 直接复制下面的提示词粘贴进去。如果生成后觉得某部分不够好，再用“修改指令”微调（例如：“把那个绿色的圆改成更深一点的蓝”）。

---

### 🚀 给 Coding Agent 的超级提示词 (直接复制)

```markdown
# Role
You are a top-tier Senior Frontend Engineer specializing in HealthTech UI/UX design. Build a mobile-first, professional "SoothPal" pain management prototype.

# Technical Stack
- Framework: React (Next.js)
- Styling: Tailwind CSS
- Icons: Lucide React
- Components: Shadcn UI (or similar clean primitives)
- Charts: Recharts

# UI/UX Style
- Color Palette: Primary #2B5FA6 (Medical Blue), Secondary #4ECDC4 (Soft Mint/Teal), Alert #FF6B6B (Soft Red).
- Aesthetic: Minimalist, "Apple Health" style, high whitespace, rounded corners (xl), soft shadows.
- Typography: Sans-serif, clean, readable.

# Page 1: Home Dashboard (The "Wow" Factor)
1. **Header**: "Hello, [User Name]", with a gentle "Professional" greeting.
2. **Body Map Component**: 
   - A minimalist, stylized SVG human silhouette (outline).
   - The SVG should have clickable hot zones (Head, Neck, Shoulders, Lumbar, Knees).
   - When a zone is clicked, it highlights in #FF6B6B and triggers a modal: "Rate your pain (0-10)".
3. **Trend Chart**: Use a simple AreaChart showing "Pain Intensity" over the last 7 days. Make the color gradients soft.
4. **Quick Action**: A "Chat with AI Assistant" floating action button.

# Page 2: AI Assistant Module (The "Agent" Factor)
1. **Chat UI**: 
   - A clean chat window.
   - Simulate an AI response: "I see you clicked on the Lumbar region. Based on your history, this is the 3rd time this week. According to the '2024 Chronic Pain Guidelines', let's try a gentle heat compress. Would you like me to show a 2-minute video?"
   - Include a "Citation" label below the text: "Source: 2024 Chronic Pain Management Guide".

# Functional Requirements
- Responsive mobile view.
- Smooth animations (framer-motion if possible).
- The "Body Map" should feel intuitive and responsive.
- The UI must look like a real, deployed medical product, not a wireframe.

# Instructions
- Create a single-page application structure with tabs for "Dashboard" and "AI Chat".
- Use Lucide icons for navigation.
- Ensure the contrast is high enough for elderly users (as per the "accessibility" requirement of the project).
```

---

### 💡 如何在答辩现场演示 (Demo 话术)

当评委看到屏幕亮起时，请按这个逻辑演示，效果最好：

1.  **演示“采集” (视觉冲击)：**
    *   *话术：* “评委老师，看，我们完全抛弃了枯燥的问卷。用户只需像点击地图一样，在人体图上轻触，系统瞬间就能捕获精确的疼痛位置和强度。” (点击人体腰部 -> 弹出打分条 -> 点击确认) —— **（评委内心：这个交互很潮，解决麻烦）**

2.  **演示“AI决策” (智力震慑)：**
    *   *话术：* “但如果只停留在记录，就是普通的打卡软件。我们的核心是AI Agent。当我标记腰部疼痛后，看AI怎么回复。” (点击AI助手)
    *   *话术：* “注意看，它不仅给出了缓解建议，还标注了来源——‘引用自2024版临床指南’。这是我们RAG知识库实时检索的结果，这叫医疗的可解释性。” —— **（评委内心：这有专业背书，不是胡扯）**

3.  **演示“趋势” (数据壁垒)：**
    *   *话术：* “最后，系统会自动生成这份趋势图，让用户能直观看到自己每天的康复进展。数据闭环，让用户坚持下去。” —— **（评委内心：这就是用户留存！）**

### ⚠️ 给技术负责人的特别提示
*   **如果不小心生成了丑的UI：** 直接对 Agent 说：“这个太像程序员做的了，请增加圆角（rounded-2xl），增加卡片阴影（shadow-sm），并使用更多的白色背景以提升呼吸感。”
*   **关于人体图：** 如果 AI 生成的 SVG 交互太复杂，直接跟 Agent 说：“用一个简单的 SVG 包含 `path` 元素即可，不需要真实的 3D 模型。” 简单的 SVG 只要能点击变色，在比赛中就足够了。

这套逻辑和 Demo 演示，足以让你在技术分上拉开差距！加油！

下面给你一份可以直接丢给 **Coding Agent（Cursor / Claude Code / Copilot Workspace / Devin 类）**的“高压提示词”。目标是 **48小时内做出能震慑评委的可运行 Demo**：手机尺寸 Web App（PWA风格）模拟小程序核心体验，包含 **人体疼痛涂抹/点选 + 语音一键随访结构化 + 风险预警分级 + 亲情号视图 + RAG带引用的通俗问答 + 脱敏转发到 ima 的可行流程演示**。

> 你把下面整段复制给 coding agent 即可。  
> 如你们必须做微信小程序版，我也在末尾给了“备选提示词（小程序+云开发）”。

---

## 给 Coding Agent 的提示词（主方案：Next.js 全栈 Demo，手机端体验，最省时间）

你是一个资深全栈工程师+产品原型实现专家。请为“舒伴 SoothPal（慢性疼痛居家管理）”在极短时间内实现一个可运行的 Demo，用于创业比赛答辩展示“零负担采集 + AI深度融合 + 风险预警 + 亲情号守护”。要求：代码可直接运行、界面像手机小程序、演示路径一镜到底。

### 1. 交付物（Definition of Done）
请在一个 Git 仓库中生成完整代码与说明文档，满足：
- `npm install && npm run dev` 一键启动（本地即可，不依赖云）
- 默认使用 **Mock AI** 也能跑通；若设置环境变量 `LLM_API_KEY` 则启用真实大模型
- 包含 `README.md`（安装运行/演示脚本/环境变量说明）
- 包含 `docs/demo_script.md`（答辩演示逐步操作脚本：3分钟版 + 6分钟版）
- 所有数据使用合成数据，不包含真实隐私
- UI 适配手机：iPhone 13 尺寸为基准（390x844），页面像小程序卡片式

### 2. 技术栈（请严格采用，避免发散）
- 前端：Next.js 14（App Router）+ TypeScript + TailwindCSS + shadcn/ui（或同等轻量组件）
- 数据：SQLite（本地文件）+ Prisma（可选；如果太慢，用 `better-sqlite3` 也可以）
- 图表：Chart.js 或 Recharts（任选一种）
- RAG：优先做最小可用检索  
  - 无 key 时：TF-IDF/关键词检索（本地实现）+ 模板生成  
  - 有 key 时：embedding + topK 检索 + LLM 生成（可用任意兼容 OpenAI 格式的 API）
- 语音：用浏览器 Web Speech API（SpeechRecognition）做“语音→文本”，不做服务器端音频上传
- PWA 非必须，但视觉上要像移动端

### 3. Demo 必须具备的“震撼点”（强制实现）
#### A) 10 秒随访：2D 人体疼痛点选/涂抹 + NRS 滑条
- 页面：`/record`
- 用一个 SVG 人体图（前/后切换）实现“点选区域”（至少 12 个区域：头颈、肩、胸、上腹、下腹、腰背、臀、上肢、手、下肢、膝、足等）
- 支持两种输入：
  1) 点选区域（region_id）  
  2) 简化“涂抹模式”：不需要真画笔算法，只要允许用户在人体图上拖动后把相邻区域标为选中即可（看起来像涂抹即可）
- 强度：0–10 大滑条
- 保存后跳转仪表盘并触发风险评估

#### B) 语音“一句话打卡”→ AI 结构化 → 一键确认卡片
- 页面同样在 `/record` 中提供“语音输入”按钮
- 流程：语音转文字 → 解析为结构化 JSON（pain_score、regions、trigger、relief、medication、sleep）  
  - 无 LLM 时：用正则/关键词规则解析（写得可靠一点）  
  - 有 LLM 时：调用模型让其输出严格 JSON（并做 JSON schema 校验）
- 显示“确认卡片”（超大按钮：确认 / 修改），确认即保存记录

#### C) 风险预警：阈值 + 突变 + 状态机 + 分级响应（L1/L2/L3）
- 保存记录时自动执行风险引擎，输出：
  - `risk_level`（1/2/3/0）
  - `reasons[]`（可解释原因，如 “NRS>=8” “较7日均值突增3.2” “术后第1周阈值下调命中”）
- L1：弹出红色强提醒 Modal（含“建议立即就医”按钮）并生成“紧急摘要报告”
- L2：黄色提醒 + 推送对应科普
- L3：依从性提醒（本 demo 可用“模拟：3天未记录”按钮触发）

#### D) 亲情号视图（家属端）
- 页面：`/family`
- 只显示：趋势摘要 + 最近预警 + “超过3天未记录提醒”
- 不显示详细隐私字段（体现最小必要原则）
- 在用户端触发 L1 时，家属端会出现一条新提醒（用本地 DB 或全局状态实现）

#### E) RAG 个体化问答（带引用）+ “ima 脱敏检索流程”展示
- 页面：`/ask`
- 内置一个小型知识库（10~20条 markdown 切片即可，放在 `data/kb/*.md`），内容包含：
  - 慢性腰痛基础科普
  - 术后早期康复注意事项
  - 红旗征象（何时必须就医）
  - 用药安全边界（不做剂量调整）
- 实现 RAG：
  - 检索：返回 topK 切片（展示标题）
  - 生成回答：必须“通俗化、步骤化、适老短句”
  - 输出末尾必须显示“参考来源：xxx（chunk_id）”
- **ima 流程演示**（不要求真连 ima）：  
  - 先做脱敏：把提问中的姓名/电话/医院/精确地址等替换为 [REDACTED]  
  - UI 上展示“脱敏前/脱敏后 Query”
  - 再走检索（本地 KB），并在 UI 标注“此处可替换为 ima 检索结果”
- 安全护栏：如果提问包含高危关键词（如“麻木无力/大小便异常/突发剧痛/发热”），回答必须优先输出“建议就医”，并拒绝给处方剂量建议

### 4. 页面信息架构（必须实现这些页面）
- `/`：主页（今天状态卡：痛感、步数、睡眠、今日建议；两个按钮：开始记录 / AI问答）
- `/record`：随访记录（人体图+滑条+语音结构化+确认卡片）
- `/dashboard`：趋势仪表盘（7天折线：NRS；柱状：步数；列表：最近预警）
- `/alerts`：预警历史与紧急摘要报告（展示 reasons）
- `/family`：亲情号视图（趋势摘要+预警+失访提醒）
- `/ask`：AI问答（RAG带引用 + 脱敏流程展示）
- `/admin/kb`（可选加分）：知识库切片列表（仅展示，不必做上传）

### 5. 数据模型（最小可用即可）
请建表或用 JSON 文件持久化（优先 SQLite）：
- `users`：demo 只需要一个 user
- `profile`：包含 `stage`（如 `postop_week1`/`rehab`）、`pain_type_tags[]`
- `pain_records`：date、regions(JSON)、nrs、note_text、source(voice/manual)
- `risk_events`：record_id、level、reasons(JSON)、created_at
- `family_links`：绑定关系（demo 固定一个 family）
- `kb_chunks`：id、title、text、tags、source
- `push_log`（可选）：模拟推送记录

### 6. 风险规则（按以下实现，便于答辩解释）
- L1：`nrs >= 8`  
- L1：`nrs - avg(last7days) >= 3` 且 `nrs >= 6`
- L2：`nrs in [5..7]` 且连续 3 天
- 状态机阈值调整：若 `stage=postop_week1`，则 L2 触发阈值下调 1 分
- 失访：距离最后一次记录 `>=3天` → L3，并在 family 端提示

### 7. “震撼演示场景”必须内置（按钮一键生成）
在主页或 dashboard 放 2 个按钮，方便答辩时一键演示：
- `加载示例数据（稳定）`：生成最近 7 天记录（NRS 3~4）+ 正常趋势
- `加载高危场景（突增）`：生成最近 7 天均值 4，今天一条 8 分 → 触发 L1，并联动 family 端

### 8. 质量与细节要求（让评委觉得你们真能落地）
- 每次风险评估输出必须显示 reasons（可解释）
- RAG 输出必须带引用 chunk_id
- UI 文案要适老：短句、分点、按钮大、避免学术表达
- README 里写清楚：哪些是 mock、如何切换真实 LLM
- 注意：不要引入复杂登录；所有功能单用户 demo 即可

### 9. 你需要输出什么（Coding Agent 的输出格式）
- 生成完整项目文件树
- 关键文件代码（前端页面、API、规则引擎、RAG检索）
- `README.md` + `docs/demo_script.md`
- 提供 2–3 张 demo 截图（可选：用 Playwright 截图脚本）

立即开始实现。优先保证能跑、能演示、一镜到底，避免过度工程化。

---

## 备选提示词（如果你们必须做“微信小程序 + 云开发”版本）
> 只有在评委明确要求“必须是小程序”时用。否则主方案更快更稳。

你是资深微信小程序工程师。请用“微信小程序原生 + 云开发 CloudBase（云函数+云数据库+云存储）”实现 SoothPal Demo，目标是答辩展示：人体图疼痛点选/涂抹、语音录入结构化、风险引擎分级预警、订阅消息模拟、亲情号视图、RAG带引用问答（可 mock）。要求：提供完整小程序代码、云函数代码、数据库集合设计、部署步骤文档、演示脚本；能在开发者工具本地跑通。人体图用 Canvas/SVG；语音用微信接口；风险引擎在云函数触发器（监听 pain_record 新增）中执行；问答通过云函数调用 LLM（无 key 时 mock）。输出 README 和 docs/demo_script.md。
