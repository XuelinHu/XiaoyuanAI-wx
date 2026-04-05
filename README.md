<p align="center">
  <img height="20" src="https://img.shields.io/badge/WeChat_Mini_Program-Mock_UI-07C160" />
  <img height="20" src="https://img.shields.io/badge/JavaScript-ES6-F7DF1E" />
  <img height="20" src="https://img.shields.io/badge/WXML-View_UI-1A73E8" />
  <img height="20" src="https://img.shields.io/badge/WXSS-Warm_%2B_Blue-FF8A3D" />
  <img height="20" src="https://img.shields.io/badge/Chat-Mock_Response-5A9BFF" />
  <img height="20" src="https://img.shields.io/badge/Tabs-%E4%BC%9A%E8%AF%9D%20%7C%20%E5%8E%86%E5%8F%B2%20%7C%20%E6%88%91%E7%9A%84-F26A21" />
</p>

# XiaoyuanAI-wx

“小元”微信小程序前端项目，当前版本使用 mock 数据实现仿 ChatGPT / DeepSeek 风格的癌症情绪支持聊天界面。

## 功能概览

- 会话页：支持消息发送、加载中动画、自动滚动、长按复制。
- 历史页：展示 mock 会话记录列表。
- 我的页：展示个人设置与功能入口占位。
- 底部导航：包含“历史 / 会话 / 我的”三个 tab。

## 目录结构

```text
.
├─components/
│  └─bottom-tabs/
├─pages/
│  ├─chat/
│  ├─history/
│  └─profile/
├─app.js
├─app.json
├─app.wxss
└─project.config.json
```

## 说明

- 当前仓库以页面原型和交互 mock 为主，尚未接入真实聊天接口。
- 视觉风格采用橙色暖色调与蓝色辅助色的组合。
- `project.private.config.json` 已忽略，不参与版本管理。
