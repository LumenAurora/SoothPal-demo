# SoothPal Web Demo（评委演示版）

这是“舒伴 SoothPal”用于大学生创业竞赛的高保真 Web Demo。

核心目标：
- 3 分钟演示闭环：采集 -> AI 抽取 -> 风险预警 -> 周报 -> 亲情号通知
- 视觉观感拉满：深色医疗科技风 + 高反馈交互
- GitHub Pages 一键部署，方便评委远程访问

## 技术栈

- React + TypeScript + Vite
- Framer Motion + GSAP（动效）
- Zustand（场景状态）
- ECharts（趋势图）

## 本地运行

```bash
npm install
npm run dev
```

默认地址：`http://127.0.0.1:4173/`

## 构建

```bash
npm run build
npm run preview
```

## 页面结构

- Hero：项目核心价值
- Scene A：10 秒疼痛打卡（2D 身体点选）
- Scene B：语音 -> 结构化抽取
- Scene C：规则引擎预警（rule_id 可追溯）
- Scene D：周报自动生成（趋势+建议）
- Family：亲情号摘要通知
- Demo Console：一键切换场景/自动演示

## GitHub Pages 部署

仓库根目录已经提供工作流：
- `.github/workflows/deploy-pages.yml`

生效条件：
1. 推送到 `main` 分支
2. 仓库 `Settings -> Pages` 里选择 `GitHub Actions` 作为发布源

首次部署后，访问：
- `https://<your-username>.github.io/<repo-name>/`

## 演示建议

- 演示前先切到 `critical` 场景，展示“红色预警”冲击力
- 再点“一键 3 分钟演示”，完整展示闭环
- 保留本地构建产物作为离线备用

## 注意事项

- 当前 bundle 体积较大（主要来自 ECharts），属 Demo 可接受范围
- 如果后续追求极致加载速度，可把图表模块做懒加载
