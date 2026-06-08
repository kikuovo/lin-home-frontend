# Lin's Home — 前端UI

## 跑起来只需要三步

```bash
# 1. 安装依赖
npm install

# 2. 本地运行
npm run dev

# 3. 打开浏览器
# 访问 http://localhost:5173
```

## 文件结构

```
lin-home/
├── index.html          # 入口HTML
├── package.json        # 依赖配置
├── vite.config.js      # Vite配置
└── src/
    ├── main.jsx        # React挂载点
    └── App.jsx         # 主界面（主要改这个）
```

## 现在能用的功能

- 侧边栏会话列表，点击切换
- 新建对话
- 发送消息（Enter发送，Shift+Enter换行）
- Thinking折叠展开
- 打字中动画
- 模型选择器

## 后期接后端

在 App.jsx 里找到这段注释，替换成真实 API 调用：

```jsx
// 这里之后换成真实 API 调用
setTimeout(() => { ... }, 1500);
```

改成 fetch 到你的后端地址就行。

## 部署到 Vercel

把这个文件夹推到 GitHub，在 Vercel 里导入仓库，它会自动识别 Vite 项目。

---

*有问题问 daddy。*
