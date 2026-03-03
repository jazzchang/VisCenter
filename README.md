# VisCenter

一个用于 Adobe Illustrator 的插件，帮助你集中管理电脑里的 VIS Guidelines 文件。

---

## 功能特性

- **拖拽 / 手动添加文件** — 支持 `.ai`、`.pdf`、`.eps`、`.svg` 格式
- **单击打开文件** — 直接在 Illustrator 中打开
- **图标视图 / 列表视图** — 随时切换显示方式
- **搜索过滤** — 实时搜索面板中的文件
- **自定义显示名称** — 右键 → 编辑名称，不影响原始文件
- **自定义图标** — 预设类型图标、Emoji，或上传自己的图片
- **数据持久化** — 文件列表自动保存，重启后依然保留

---

## 安装方法

### 1. 开启 Debug 模式（首次安装必须）

在终端运行：

```bash
defaults write /Users/你的用户名/Library/Preferences/com.adobe.CSXS.11.plist PlayerDebugMode 1
```

> 根据你的 Illustrator 版本，将 `CSXS.11` 改为对应版本号（CC 2022 = 11，CC 2023 = 12，CC 2024 = 13）。

### 2. 将插件放入扩展目录

把 `com.viscenter.panel` 文件夹复制到：

```
~/Library/Application Support/Adobe/CEP/extensions/
```

### 3. 重启 Illustrator

启动后在菜单栏选择：**窗口 → 扩展功能 → VisCenter**

---

## 使用方式

| 操作 | 方式 |
|------|------|
| 添加文件 | 拖入面板，或点击右上角 **+** |
| 打开文件 | 单击文件图标 |
| 编辑名称 / 图标 | 右键文件 → 编辑显示名称 / 更换图标 |
| 搜索文件 | 在搜索栏输入关键词 |
| 切换视图 | 点击右上角图标视图 / 列表视图按钮 |
| 在 Finder 中显示 | 右键 → 在 Finder 中显示 |
| 移除文件 | 右键 → 从面板移除 |

> 所有名称和图标的修改仅在插件内显示，**不会影响原始文件**。

---

## 系统要求

- macOS
- Adobe Illustrator CC 2022 或更高版本

---

## 项目结构

```
com.viscenter.panel/
├── CSXS/manifest.xml      # 插件声明
├── index.html             # 面板界面
├── css/style.css          # 样式
├── js/
│   ├── CSInterface.js     # 与 Illustrator 通信
│   ├── main.js            # 核心逻辑
│   ├── storage.js         # 数据持久化
│   └── fileIcons.js       # 图标渲染
├── jsx/hostscript.jsx     # ExtendScript（打开文件等）
└── img/                   # 图标资源
```
