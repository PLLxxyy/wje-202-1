# 垂钓日志 (Fishing Log)

一款纯前端钓鱼记录应用，帮助钓友记录每次出钓的详细信息，包括钓点、鱼种、重量、天气等，并提供数据统计和钓点管理功能。

## 功能特性

- **时间线视图**：按日期分组展示钓鱼记录，包含日期、地点、天气、鱼种、重量、饵料和照片占位
- **新增记录**：点击右下角"+"按钮，填写钓点、鱼种、重量等信息，快速记录每次出钓
- **统计页面**：
  - 近 12 个月钓鱼频次柱状图
  - 鱼种收获分布饼图
  - 月度详情（出钓次数、总收获、钓获鱼种数、常去钓点）
  - 最大单尾记录展示
  - 个人最佳排行榜（按重量排序）
- **钓点地图**：10×10 网格展示钓点分布，颜色深浅表示到访次数
- **收藏功能**：收藏常去的钓点，方便管理
- **数据持久化**：所有数据存储在 localStorage，刷新不丢失

## 技术栈

- **Vite** + **React 18** + **TypeScript**
- 纯 CSS 图表（柱状图、饼图使用 conic-gradient）
- localStorage 数据持久化
- 所有样式写在 `index.html` 的 `<style>` 标签中，无额外 CSS 文件
- 无第三方 UI 库

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
wje-202/
├── index.html          # 入口文件（含全局样式）
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx            # 应用入口
│   ├── App.tsx             # 主应用组件（路由、状态管理）
│   ├── types.ts            # TypeScript 类型定义
│   ├── storage.ts          # localStorage 工具函数
│   ├── TimelinePage.tsx    # 时间线页面
│   ├── StatsPage.tsx       # 统计页面
│   ├── MapPage.tsx         # 钓点地图页面
│   ├── AddRecordModal.tsx  # 新增记录弹窗
│   └── DetailModal.tsx     # 记录详情弹窗
└── README.md
```
