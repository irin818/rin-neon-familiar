# RIN // Neon Familiar

<p align="center">
  <img src="./public/assets/rin-dual-og.jpg" alt="黑绿与粉色双生 RIN 的霓虹直播场景" width="900" />
</p>

一个围绕 RIN 双生频道展开的沉浸式二次元互动网页：进入霓虹首屏、阅读可选择的夜行档案、探索直播场景，并游玩剧情探索章节《RIN：霓虹回声》和双生信号节奏游戏。

**在线体验：** [https://irin818.github.io/rin-neon-familiar/](https://irin818.github.io/rin-neon-familiar/)

## 体验内容

- 参考赛博编辑式界面设计的沉浸首屏，包含同步核心、环境音与中英界面切换。
- 三段可切换角色档案：双生直播、天台信号、创作室。
- 绿色 / 粉色频道切换、逐字对话与真实分支反馈。
- 可点击直播场景热点，解释视觉与游戏信号系统。
- `RIN: NEON ECHOES` Chapter 0 可玩章节：五个城市节点、分支对话、伙伴关系、现实涂鸦、声学破解和本机存档。
- `RIN // DUAL LINK` 确定性节奏小游戏，支持键盘、触屏、暂停、辅助判定、无计时顺序模式、等级结算与本机最高分。
- 响应式布局、减少动态效果支持、语义化内容、Open Graph、JSON-LD、sitemap 与 GitHub Pages 自动发布。

## 游戏操作

### RIN：霓虹回声

| 操作 | 键盘 | 鼠标 / 触屏 |
| --- | --- | --- |
| 选择热点与对话 | `Tab` 聚焦，`Enter` / `Space` 确认 | 点击 / 轻触 |
| 观察场景 | 移动指针 | 移动鼠标 / 拖动画面 |
| 现实涂鸦 | 聚焦后使用“键盘辅助描摹” | 在画布上按住并描摹 |
| 声学破解 | 聚焦滑杆或使用 `−` / `＋` | 拖动滑杆或轻触 `−` / `＋` |
| 城市地图 | `M` | 点击 HUD 地图按钮 |
| 暂停 / 返回网站 | `Esc` | 点击 HUD 暂停按钮 |

游戏会自动写入版本化的浏览器本机存档。暂停菜单支持导出 JSON、导入 JSON 和确认后重置新游戏；损坏或不兼容的存档会安全回退到初始状态。

### RIN // DUAL LINK

| 信号 | 键盘 | 触屏 |
| --- | --- | --- |
| 绿色频道 | `A` / `←` | `绿频 A` |
| 粉色频道 | `D` / `→` | `粉频 D` |
| 双生频道 | `Space` | `双生 ∞` |

信号到达底部波形同步线时输入。判定分为 `PERFECT`、`GOOD`、`OK`、`MISS`；辅助判定会把时间窗口扩大为 1.5 倍。需要无计时体验时，可开启“顺序模式”，按页面提示逐个选择绿色、粉色或双生频道。

## 本地运行

要求 Node.js 22。

```bash
npm ci
npm run dev
```

开发地址：`http://127.0.0.1:5173/rin-neon-familiar/`

完整检查：

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run preview -- --host 127.0.0.1
```

## 项目结构

```text
src/components/      页面、故事、档案与游戏界面
src/data/            角色章节与素材映射
src/game/            纯逻辑节奏引擎、Neon Echoes 数据/系统及单元测试
src/hooks/           滚动、高亮、音频与逐字效果
public/assets/       优化后的正式角色图片与分享图
docs/design/         已批准的首屏视觉概念
.github/workflows/   GitHub Pages 构建与发布
```

## 静态部署与搜索收录

推送到 `main` 后，GitHub Actions 会运行 lint、类型检查、测试、构建并发布 `dist/`。页面已包含 canonical、Open Graph、可爬取的静态回退内容、结构化数据和 sitemap。

搜索引擎收录不是即时的。首次上线后可在 Google Search Console 添加 URL-prefix 属性，提交：

```text
https://irin818.github.io/rin-neon-familiar/sitemap.xml
```

通常需要数天到数周才能在搜索结果中出现，具体排名无法保证。

## 数据与隐私

- 不需要登录，也没有服务器端数据收集。
- 节奏游戏最高分和《霓虹回声》世界状态仅保存在浏览器 `localStorage`。
- 环境音与游戏音效默认关闭，必须由用户主动开启。

## 素材权利

角色图片由项目所有者提供，仅用于本项目展示。仓库公开不代表角色、美术素材或衍生形象被授予再分发、训练、商用或改作许可。代码与美术素材应分开处理授权。
