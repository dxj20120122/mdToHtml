# Markdown to HTML 转换组件

这是一个轻量级的Markdown转HTML组件，可以将Markdown文本实时转换为HTML。该组件支持大多数常用的Markdown语法，并且可以作为Web Component使用。

## 特性

- 支持基本的Markdown语法（标题、列表、链接、图片等）
- 支持代码块高亮
- 支持表格
- 支持任务列表
- 实时预览
- 可作为Web Component使用

## 使用方法

### 直接引用

```html
<script src="https://dxj20120122.github.io/mdToHtml/md-to-html.js"></script>
```

### 基本使用

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://dxj20120122.github.io/mdToHtml/md-to-html.js"></script>
</head>
<body>
    <md-to-html content="# Hello World"></md-to-html>
</body>
</html>
```

### 动态内容

```html
<textarea id="editor"></textarea>
<md-to-html id="preview"></md-to-html>

<script>
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');

editor.addEventListener('input', () => {
    preview.setAttribute('content', editor.value);
});
</script>
```

## 支持的语法

- 标题 (h1 ~ h6)
- 粗体和斜体
- 有序和无序列表
- 任务列表
- 链接和图片
- 代码块和行内代码
- 表格
- 引用
- 水平线

## 许可证

MIT License