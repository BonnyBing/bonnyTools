# 🔄 WebM 视频转换工具

一个专注于将常见视频格式转换为 WebM（VP9/VP8 编码）的轻量级 React 应用。所有处理都在浏览器端完成，无需上传文件。

## ✨ 功能特点

- 📂 支持拖选本地视频文件（MP4、MOV、AVI 等）
- 🧠 自动检测原始帧率并在最高 60fps 下转换
- 🎯 根据分辨率自动选择 15–35Mbps 的高质量码率
- 🔐 完全在浏览器内处理，保护隐私
- 📊 进度实时展示，可追踪转换状态

## 🚀 快速开始

```bash
npm install
npm run dev
```

或直接运行 `npm start` 执行环境检查、依赖安装和开发服务器启动。

## 🖥️ 使用方法

1. 点击“📹 选择视频文件转换为 WebM”按钮
2. 选择需要转换的视频文件
3. 等待进度条完成（过程中可随时看到百分比）
4. 浏览器会自动下载 `.webm` 文件

## 📁 项目结构

```
src/
├── components/
│   └── VideoConverter/
│       ├── VideoConverter.jsx
│       ├── VideoConverter.css
│       └── index.js
├── utils/
│   └── videoConverter.js
├── App.jsx
├── index.css
└── main.jsx
```

## 🧰 技术栈

- React 18
- Vite
- MediaRecorder API + Canvas API

## ⚙️ 系统要求

- Node.js ≥ 16
- 现代浏览器（Chromium 90+、Firefox 88+、Edge 90+）并支持 MediaRecorder API

---

欢迎根据需求二次开发或改造成你的 WebM 转换工具！ 🎉
